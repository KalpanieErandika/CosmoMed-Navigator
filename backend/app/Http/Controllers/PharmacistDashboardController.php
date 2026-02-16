<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class PharmacistDashboardController extends Controller
{

    public function orderCounts(Request $request)
{
    $user = $request->user();

    if (!$user->pharmacy_id) {
        return response()->json([
            'total' => 0,
            'pending' => 0,
            'approved' => 0,
            'rejected' => 0,
        ]);
    }

    $query = Order::where('pharmacy_id', $user->pharmacy_id);

    return response()->json([
        'total' => $query->count(),
        'pending' => (clone $query)->where('status', 'pending')->count(),
        'approved' => (clone $query)->where('status', 'approved')->count(),
        'rejected' => (clone $query)->where('status', 'rejected')->count(),
    ]);
}

   public function ordersPerDay(Request $request)
{
    $pharmacyId = $request->user()->pharmacy_id;

    if (!$pharmacyId) return response()->json([]);

    return Order::selectRaw('DATE(order_date) as date, COUNT(*) as count')
        ->where('pharmacy_id', $pharmacyId)
        ->groupBy('date')
        ->orderBy('date')
        ->get();
}

    public function orders(Request $request)
    {
        $pharmacyId = $request->user()->pharmacy_id;

        return Order::where('pharmacy_id', $pharmacyId)
            ->orderBy('order_date', 'desc')
            ->get();
    }

    public function approve($id, Request $request)
    {
        Order::where('order_id', $id)->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Order approved']);
    }

    public function reject($id, Request $request)
    {
        Order::where('order_id', $id)->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejected_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Order rejected']);
    }
}
