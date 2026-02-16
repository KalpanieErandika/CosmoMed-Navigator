<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderApproved;
use App\Mail\OrderRejected;
use App\Mail\NewOrderNotification;

class OrderController extends Controller
{
    public function placeOrder(Request $request)
{
    DB::beginTransaction();
    try {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'address' => 'required|string|max:255',
            'contact_no' => 'required|integer|digits_between:9,10',
            'quantity' => 'required|integer|min:1',
            'prescription_id' => 'nullable|integer|exists:prescription,prescription_id',
            'rare_id' => 'required|integer|exists:rare_medicine,rare_id',
            'pharmacy_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        //check stock availability
        $medicine = DB::table('rare_medicine')
            ->where('rare_id', $data['rare_id'])
            ->select('quantity', 'medicine_name', 'user_id')
            ->first();

        if (!$medicine) {
            return response()->json([
                'status' => false,
                'message' => 'Medicine not found'
            ], 404);
        }
        if ($medicine->quantity < $data['quantity']) { //prevent ordering more than available stock
            return response()->json([
                'status' => false,
                'message' => "Insufficient stock. Only {$medicine->quantity} units available of {$medicine->medicine_name}",
                'available_stock' => $medicine->quantity
            ], 400);
        }
        //insert order
        $orderId = DB::table('orders')->insertGetId([
            'user_id' => $user->id,
            'prescription_id' => $data['prescription_id'] ?? null,
            'rare_id' => $data['rare_id'],
            'pharmacy_id' => $data['pharmacy_id'] ?? null,
            'name' => $data['name'],
            'address' => $data['address'],
            'contact_no' => $data['contact_no'],
            'quantity' => $data['quantity'],
            'status' => 'pending',
            'order_date' => now(),
        ]);

        //get inserted order with details
        $order = DB::table('orders as o')
            ->join('rare_medicine as rm', 'o.rare_id', '=', 'rm.rare_id')
            ->where('o.order_id', $orderId)
            ->select('o.*', 'rm.medicine_name', 'rm.user_id as pharmacist_id') //all columns from orders
            ->first();

        //find pharmacist from rare_medicines
        $pharmacist = DB::table('users')
            ->where('id', $medicine->user_id)
            ->where('user_type', 'pharmacist')
            ->where('pharmacist_status', 'approved')
            ->first();//return one record

        if ($pharmacist) {
            try {
                DB::table('notifications')->insert([ //save notification
                    'user_id' => $pharmacist->id,
                    'title' => 'New Order Received',
                    'message' => "New order {$orderId} received for {$medicine->medicine_name}",
                    'type' => 'order',
                    'related_id' => $orderId,
                    'related_type' => 'order',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Send email
                if ($pharmacist->email) {

                    $customerDetails = (object) [
                        'name' => $data['name'],
                        'email' => $user->email,
                        'contact_no' => $data['contact_no']
                    ];

                    Mail::to($pharmacist->email)
                        ->send(new NewOrderNotification($order, $pharmacist, $customerDetails));

                    Log::info("New order email sent", [
                        'pharmacist_email' => $pharmacist->email
                    ]);
                }

            } catch (\Exception $e) {
                Log::warning("Could not process pharmacist notification: " . $e->getMessage());
            }
        }
        DB::commit(); //make all changes permanent

        //calculate remaining stock
        $remaining = $medicine->quantity - $data['quantity'];

        return response()->json([
            'status' => true,
            'message' => 'Order placed successfully! Waiting for pharmacist approval.',
            'data' => $order,
            'stock_info' => [
                'medicine_name' => $medicine->medicine_name,
                'ordered_quantity' => $data['quantity'],
                'remaining_stock' => $remaining
            ]
        ]);

    } catch (\Exception $e) {

        DB::rollBack(); //undo all the changes

        return response()->json([
            'status' => false,
            'message' => 'Error placing order'
        ], 500);
    }
}
    //get all orders for pharmacist
    public function getAllPharmacistOrders(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || $user->user_type !== 'pharmacist') {
                return response()->json([
                    'status' => false,
                    'message' => 'Pharmacist access required'
                ], 403);
            }
            $status = $request->query('status');
            $search = $request->query('search');
            $dateFrom = $request->query('date_from');
            $dateTo = $request->query('date_to'); //optional parameters

            // Start the query
            $query = DB::table('orders as o')
                ->join('rare_medicine as rm', 'o.rare_id', '=', 'rm.rare_id')
                ->leftJoin('prescription as p', 'o.prescription_id', '=', 'p.prescription_id')
                ->leftJoin('users as customer', 'o.user_id', '=', 'customer.id')
                ->select(
                    'o.order_id', 'o.name as customer_name', 'o.address as delivery_address', 'o.contact_no as customer_contact',
                    'o.quantity','o.status', 'o.order_date', 'o.approved_at', 'o.approved_by', 'o.rejected_at','o.rejected_by',
                    'rm.medicine_name','rm.dosage_form', 'rm.strength', 'rm.unit_price', 'p.prescription_image', 'p.prescription_id','customer.email as customer_email'
                )
                ->where('rm.user_id', $user->id);

            //apply status filter
            if ($status && in_array($status, ['pending', 'approved', 'rejected'])) {
                $query->where('o.status', $status);
            }

            //apply search filter
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('o.name', 'like', "%{$search}%")
                      ->orWhere('rm.medicine_name', 'like', "%{$search}%")
                      ->orWhere('o.contact_no', 'like', "%{$search}%");
                });
            }
            //apply date range filter
            if ($dateFrom) {
                $query->whereDate('o.order_date', '>=', $dateFrom);
            }
            if ($dateTo) {
                $query->whereDate('o.order_date', '<=', $dateTo);
            }
            $orders = $query->orderBy('o.order_date', 'desc')->get();

            //process results
            $orders = $orders->map(function ($order) {
                $order->total_price = $order->quantity * (float) $order->unit_price;
                $order->prescription_url = $order->prescription_image
                    ? asset('storage/' . $order->prescription_image) //filename of the prescription
                    : null;

                //get approver info
                if ($order->approved_by) {
                    $approver = DB::table('users')->where('id', $order->approved_by)->first();
                    if ($approver) {
                        $order->approved_by_name = $approver->pharmacist_name ?? $approver->email;
                        $order->approved_by_email = $approver->email;
                    }
                }

                //get rejector info
                if ($order->rejected_by) {
                    $rejector = DB::table('users')->where('id', $order->rejected_by)->first();
                    if ($rejector) {
                        $order->rejected_by_name = $rejector->pharmacist_name ?? $rejector->email;
                        $order->rejected_by_email = $rejector->email;
                    }
                }
                return $order;
            });

            return response()->json([
                'status' => true,'data' => $orders, 'count' => $orders->count(),
                'filters' => [
                    'status' => $status, 'search' => $search, 'date_from' => $dateFrom, 'date_to' => $dateTo]
            ]);

        } catch (\Exception $e) {
            Log::error("Error fetching all pharmacist orders: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error fetching orders: ' . $e->getMessage()
            ], 500);
        }
    }

//approve an order with email
public function approveOrder(Request $request, $orderId)
{
    DB::beginTransaction();
    try {
        $user = $request->user();

        if (!$user || $user->user_type !== 'pharmacist') {
            return response()->json([
                'status' => false,
                'message' => 'Pharmacist access required'
            ], 403);
        }

        //get the order with medicine details
        $order = DB::table('orders as o')
            ->join('rare_medicine as rm', 'o.rare_id', '=', 'rm.rare_id')
            ->where('o.order_id', $orderId)
            ->where('rm.user_id', $user->id)
            ->select('o.*', 'rm.medicine_name', 'rm.quantity as available_quantity', 'rm.unit_price')
            ->first();

        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Order not found or unauthorized'
            ], 404);
        }
        //check if order is already processed
        if ($order->status !== 'pending') {
            return response()->json([
                'status' => false,
                'message' => "Order is already {$order->status}"
            ], 400);
        }
        //check if enough stock is available
        if ($order->available_quantity < $order->quantity) {
            return response()->json([
                'status' => false,
                'message' => "Insufficient stock. Available: {$order->available_quantity}, Ordered: {$order->quantity}",
                'available_stock' => $order->available_quantity,
                'ordered_quantity' => $order->quantity
            ], 400);
        }
        //update order status with approval info
        DB::table('orders')
            ->where('order_id', $orderId)
            ->update([
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => $user->id
            ]);

        //reduce stock quantity
        DB::table('rare_medicine')
            ->where('rare_id', $order->rare_id)
            ->decrement('quantity', $order->quantity);

        //get updated stock
        $updatedStock = DB::table('rare_medicine')
            ->where('rare_id', $order->rare_id)
            ->value('quantity');

        //get customer details
        $customer = DB::table('users')->where('id', $order->user_id)->first();

        //get pharmacist details
        $pharmacistDetails = DB::table('users')
            ->where('id', $user->id)
            ->select('pharmacist_name', 'email', 'contact_no')
            ->first();

        //get pharmacy details
        $pharmacyDetails = null;
        if ($user->pharmacy_id) {
            $pharmacyDetails = DB::table('pharmacies')->where('id', $user->pharmacy_id)->first();
        }

        //send email notification
        if ($customer && $customer->email) {
            try {
                //create order object with all needed data
                $orderData = (object) [
                    'order_id' => $order->order_id,
                    'medicine_name' => $order->medicine_name,
                    'quantity' => $order->quantity,
                    'unit_price' => $order->unit_price ?? 0,
                    'approved_at' => now(),
                    'address' => $order->address,
                    'contact_no' => $order->contact_no
                ];

                Mail::to($customer->email)
                    ->send(new OrderApproved(
                        $orderData, $customer, $pharmacistDetails, $pharmacyDetails ));

            } catch (\Exception $e) {
                Log::warning("Failed to send approval email to customer: " . $e->getMessage());
            }
        }
        //store notification for customer
        if ($customer && Schema::hasTable('notifications')) {   //prevents errors if the table hasn’t created
            try {
                DB::table('notifications')->insert([
                    'user_id' => $customer->id,
                    'title' => 'Order Approved',
                    'message' => "Your order {$orderId} for {$order->medicine_name} has been approved by {$pharmacistDetails->pharmacist_name}.",
                    'type' => 'order',
                    'related_id' => $orderId,
                    'related_type' => 'order',
                    'created_at' => now(),
                ]);
            } catch (\Exception $e) {
                Log::warning("Failed to create in-app notification: " . $e->getMessage());
            }
        }
        DB::commit();

        return response()->json([
            'status' => true,
            'message' => 'Order approved successfully. Customer has been notified via email.',
            'data' => [
                'order_id' => $orderId,
                'status' => 'approved',
                'medicine_name' => $order->medicine_name,
                'quantity' => $order->quantity,
                'approved_by' => $user->id,
            'approved_by_name' => $pharmacistDetails->pharmacist_name ?? 'Pharmacist',
            'approved_by_email' => $pharmacistDetails->email,
                'approved_by_phone' => $pharmacistDetails->contact_no,
                'old_stock' => $order->available_quantity,
                'new_stock' => $updatedStock,
                'remaining_stock' => $updatedStock,
                'customer_notified' => $customer ? true : false,
                'notification_type' => 'email'
            ]
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'status' => false,
            'message' => 'Error approving order: ' . $e->getMessage()
        ], 500);
    }
}
    //Reject an order with email
    public function rejectOrder(Request $request, $orderId)
    {
        DB::beginTransaction();
        try {
            $user = $request->user();

            if (!$user || $user->user_type !== 'pharmacist') {
                return response()->json([
                    'status' => false,
                    'message' => 'Pharmacist access required'
                ], 403);
            }

            //validate rejection reason
            $validator = Validator::make($request->all(), [
                'reason' => 'required|string|max:500'
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }
            $reason = $request->reason;

            //get the order
            $order = DB::table('orders as o')
                ->join('rare_medicine as rm', 'o.rare_id', '=', 'rm.rare_id')
                ->where('o.order_id', $orderId)
                ->where('rm.user_id', $user->id)
                ->select('o.*', 'rm.medicine_name', 'rm.quantity as current_stock')
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Order not found or unauthorized'
                ], 404);
            }

            //check if order is already processed
            if ($order->status !== 'pending') {
                return response()->json([
                    'status' => false,
                    'message' => "Cannot reject order that is already {$order->status}"
                ], 400);
            }

            //update order status with rejection info
            DB::table('orders')
                ->where('order_id', $orderId)
                ->update([
                    'status' => 'rejected',
                    'rejected_at' => now(),
                    'rejected_by' => $user->id
                ]);

            //store rejection reason
            if (Schema::hasTable('order_rejections')) {
                DB::table('order_rejections')->insert([
                    'order_id' => $orderId,
                    'pharmacist_id' => $user->id,
                    'reason' => $reason,
                    'created_at' => now()
                ]);
            }
            //get customer details
            $customer = DB::table('users')->where('id', $order->user_id)->first();

            //get pharmacist details
            $pharmacistDetails = DB::table('users')
                ->where('id', $user->id)
                ->select('pharmacist_name', 'email', 'contact_no')
                ->first();

            //get pharmacy details
            $pharmacy = null;
            if ($user->pharmacy_id) {
                $pharmacy = DB::table('pharmacies')->where('id', $user->pharmacy_id)->first();
            }

            //send email notification to customer
            if ($customer && $customer->email) {
                try {
                    //create order object
                    $orderData = (object) [ //to pass data to email
                        'order_id' => $order->order_id,
                        'medicine_name' => $order->medicine_name,
                        'quantity' => $order->quantity,
                        'rejected_at' => now(),
                        'delivery_address' => $order->address,
                        'customer_contact' => $order->contact_no
                    ];
                    Mail::to($customer->email)
                        ->send(new OrderRejected(
                            $orderData, $customer, $pharmacistDetails, $reason, $pharmacy
                        ));
                } catch (\Exception $e) {
                    Log::warning("Failed to send rejection email to customer: " . $e->getMessage());
                }
            }
            //store notification
            if ($customer && Schema::hasTable('notifications')) {
                try {
                    DB::table('notifications')->insert([
                        'user_id' => $customer->id,
                        'title' => 'Order Rejected',
                        'message' => "Your order {$orderId} for {$order->medicine_name} was rejected by {$pharmacistDetails->pharmacist_name}. Reason: {$reason}",
                        'type' => 'order',
                        'related_id' => $orderId,
                        'related_type' => 'order',
                        'created_at' => now(),
                    ]);
                } catch (\Exception $e) {
                    Log::warning("Failed to create in-app notification: " . $e->getMessage());
                }
            }
            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Order rejected successfully. Customer has been notified via email.',
                'data' => [
                    'order_id' => $orderId,
                    'status' => 'rejected',
                    'reason' => $reason,
                    'medicine_name' => $order->medicine_name,
                    'rejected_by' => $user->id,
                    'rejected_by_name' => $pharmacistDetails->pharmacist_name ?? 'Pharmacist',
                    'rejected_by_email' => $pharmacistDetails->email,
                    'rejected_by_phone' => $pharmacistDetails->contact_no,
                    'current_stock' => $order->current_stock,
                    'customer_notified' => $customer ? true : false,
                    'notification_type' => 'email'
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Error rejecting order: ' . $e->getMessage()
            ], 500);
        }
    }
//get detailed information about an order
    public function getOrderDetails(Request $request, $orderId)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            //get the basic order info
            $order = DB::table('orders as o')
                ->leftJoin('rare_medicine as rm', 'o.rare_id', '=', 'rm.rare_id')
                ->leftJoin('prescription as p', 'o.prescription_id', '=', 'p.prescription_id')
                ->leftJoin('users as customer', 'o.user_id', '=', 'customer.id')
                ->leftJoin('users as pharmacist', 'rm.user_id', '=', 'pharmacist.id')
                ->where('o.order_id', $orderId)
                ->select(
                    'o.*','rm.medicine_name','rm.dosage_form','rm.strength','rm.unit_price','rm.quantity as available_stock',
                    'p.prescription_image','p.status as prescription_status','customer.email as customer_email','pharmacist.pharmacist_name','pharmacist.contact_no as pharmacist_contact','pharmacist.email as pharmacist_email'
                )
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            //check if user has permission to view this order
            if ($user->user_type === 'general_user' && $order->user_id !== $user->id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized to view this order'
                ], 403);
            }

            //check if pharmacist has permission
            if ($user->user_type === 'pharmacist') {
                $ownsMedicine = DB::table('rare_medicine')
                    ->where('rare_id', $order->rare_id)
                    ->where('user_id', $user->id)
                    ->exists();

                if (!$ownsMedicine) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Unauthorized to view this order'
                    ], 403);
                }
            }

            //get approver info
            if ($order->approved_by) {
                $approver = DB::table('users')->where('id', $order->approved_by)->first();
                if ($approver) {
                    $order->approved_by_name = $approver->pharmacist_name ?? $approver->email;
                    $order->approved_by_email = $approver->email;
                    $order->approved_by_contact = $approver->contact_no;
                }
            }

            //get rejector info
            if ($order->rejected_by) {
                $rejector = DB::table('users')->where('id', $order->rejected_by)->first();
                if ($rejector) {
                    $order->rejected_by_name = $rejector->pharmacist_name ?? $rejector->email;
                    $order->rejected_by_email = $rejector->email;
                    $order->rejected_by_contact = $rejector->contact_no;
                }
            }

            //calculate totals
            $order->total_price = $order->quantity * (float) $order->unit_price;
            $order->prescription_url = $order->prescription_image
                ? asset('storage/' . $order->prescription_image)
                : null;

            return response()->json([
                'status' => true,
                'data' => $order
            ]);

        } catch (\Exception $e) {
            Log::error("Error fetching order details: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error fetching order details: ' . $e->getMessage()
            ], 500);
        }
    }
//see order history
    public function getUserOrders(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }
            $orders = DB::table('orders as o')
                ->leftJoin('rare_medicine as rm', 'o.rare_id', '=', 'rm.rare_id')
                ->leftJoin('pharmacies as p', 'o.pharmacy_id', '=', 'p.id')
                ->where('o.user_id', $user->id)
                ->select(
                    'o.*','rm.medicine_name', 'rm.dosage_form', 'rm.strength', 'rm.unit_price',
                    'p.pharmacy_name', 'p.address as pharmacy_address','p.pharmacist_name','p.district'
                )
                ->orderBy('o.order_date', 'desc')
                ->get();

            if ($orders->isEmpty()) {
                return response()->json([
                    'status' => true,
                    'message' => 'No orders found',
                    'data' => []
                ]);
            }
            return response()->json([
                'status' => true,
                'message' => 'Orders retrieved successfully',
                'data' => $orders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    //get pharmacist for an order
    private function getPharmacistForOrder($order)
    {
        //get pharmacist through rare medicine  user
        $pharmacist = DB::table('rare_medicine as rm')
            ->join('users as u', 'rm.user_id', '=', 'u.id')
            ->where('rm.rare_id', $order->rare_id)
            ->where('u.user_type', 'pharmacist')
            ->where('u.pharmacist_status', 'approved')
            ->select('u.*')
            ->first();
        return $pharmacist;
    }
    //get pharmacist's pending orders
    public function getPharmacistPendingOrders(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user || $user->user_type !== 'pharmacist') {
                return response()->json([
                    'status' => false,
                    'message' => 'Pharmacist access required'
                ], 403);
            }

            $orders = DB::table('orders as o')
                ->join('rare_medicine as rm', 'o.rare_id', '=', 'rm.rare_id')
                ->leftJoin('prescription as p', 'o.prescription_id', '=', 'p.prescription_id')
                ->leftJoin('users as customer', 'o.user_id', '=', 'customer.id')
                ->select(
                    'o.order_id','o.name as customer_name', 'o.address as delivery_address','o.contact_no as customer_contact',
                    'o.quantity','o.status','o.order_date','o.approved_at','o.approved_by','o.rejected_at', 'o.rejected_by','rm.medicine_name',
                    'rm.dosage_form','rm.strength','rm.unit_price','p.prescription_image','p.prescription_id','customer.email as customer_email'
                )
                ->where('o.status', 'pending')
                ->where('rm.user_id', $user->id)
                ->orderBy('o.order_date', 'desc')
                ->get();

            //add calculated fields
            $orders = $orders->map(function ($order) {
                $order->total_price = $order->quantity * (float) ($order->unit_price || 0);
                return $order;
            });
            return response()->json([
                'status' => true,
                'data' => $orders,
                'count' => $orders->count()
            ]);

        } catch (\Exception $e) {
            Log::error("Error fetching pending orders: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error fetching orders'
            ], 500);
        }
    }
    //get pharmacist's approved orders
    public function getPharmacistApprovedOrders(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || $user->user_type !== 'pharmacist') {
                return response()->json([
                    'status' => false,
                    'message' => 'Pharmacist access required'
                ], 403);
            }

            $orders = DB::table('orders as o')
                ->join('rare_medicine as rm', 'o.rare_id', '=', 'rm.rare_id')
                ->leftJoin('prescription as p', 'o.prescription_id', '=', 'p.prescription_id')
                ->leftJoin('users as customer', 'o.user_id', '=', 'customer.id')
                ->leftJoin('users as approver', 'o.approved_by', '=', 'approver.id')
                ->select(
                    'o.order_id','o.name as customer_name','o.address as delivery_address', 'o.contact_no as customer_contact',
                    'o.quantity','o.status','o.order_date','o.approved_at','o.approved_by','rm.medicine_name',
                    'rm.dosage_form','rm.strength','rm.unit_price','p.prescription_image','p.prescription_id','customer.email as customer_email','approver.pharmacist_name as approved_by_name','approver.email as approved_by_email'
                )
                ->where('o.status', 'approved')
                ->whereNotNull('o.approved_by')
                ->whereNull('o.rejected_by')
                ->where('rm.user_id', $user->id)
                ->orderBy('o.approved_at', 'desc')
                ->get();

            $orders = $orders->map(function ($order) { //creates a ready URL for the prescription image
                $order->total_price = $order->quantity * (float) $order->unit_price;
                $order->prescription_url = $order->prescription_image
                    ? asset('storage/' . $order->prescription_image)
                    : null;
                return $order;
            });

            return response()->json([
                'status' => true,
                'data' => $orders,
                'count' => $orders->count()
            ]);

        } catch (\Exception $e) {
            Log::error("Error fetching approved orders: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error fetching approved orders'
            ], 500);
        }
    }

    //get pharmacist's rejected orders
    public function getPharmacistRejectedOrders(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || $user->user_type !== 'pharmacist') {
                return response()->json([
                    'status' => false,
                    'message' => 'Pharmacist access required'
                ], 403);
            }

            $orders = DB::table('orders as o')
                ->join('rare_medicine as rm', 'o.rare_id', '=', 'rm.rare_id')
                ->leftJoin('prescription as p', 'o.prescription_id', '=', 'p.prescription_id')
                ->leftJoin('users as customer', 'o.user_id', '=', 'customer.id')
                ->leftJoin('users as rejector', 'o.rejected_by', '=', 'rejector.id')
                ->select(
                    'o.order_id','o.name as customer_name','o.address as delivery_address','o.contact_no as customer_contact','o.quantity',
                    'o.status','o.order_date','o.rejected_at','o.rejected_by','rm.medicine_name','rm.dosage_form','rm.strength',
                    'rm.unit_price','p.prescription_image','p.prescription_id','customer.email as customer_email','rejector.pharmacist_name as rejected_by_name','rejector.email as rejected_by_email'
                )
                ->where('o.status', 'rejected')
                ->whereNotNull('o.rejected_by')
                ->whereNull('o.approved_by')
                ->where('rm.user_id', $user->id)
                ->orderBy('o.rejected_at', 'desc')
                ->get();

            $orders = $orders->map(function ($order) {
                $order->total_price = $order->quantity * (float) $order->unit_price;
                $order->prescription_url = $order->prescription_image
                    ? asset('storage/' . $order->prescription_image)
                    : null;
                return $order;
            });
            return response()->json([
                'status' => true,
                'data' => $orders,
                'count' => $orders->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching rejected orders'
            ], 500);
        }
    }
}
