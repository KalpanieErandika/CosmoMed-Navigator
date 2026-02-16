<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class RareDrugsController extends Controller
{
    public function addRareMedicine(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
        $validator = Validator::make($request->all(), [
            'medicine_name' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'dosage_form' => 'required|string|max:50',
            'strength' => 'required|max:50',
            'unit_price' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }
        try {
            $data = $request->only
            ([
                'medicine_name', 'quantity', 'dosage_form', 'strength','unit_price' //takes only these fields
            ]);
            $data['user_id'] = $user->id; $data['created_at'] = now(); $data['updated_at'] = now();

            $rareMedicineId = DB::table('rare_medicine')->insertGetId($data);
            $rareMedicine = DB::table('rare_medicine')
                ->where('rare_id', $rareMedicineId)
                ->first(); //display the first row from database

            if ($rareMedicine)
                {
                $rareMedicine->unit_price = (float) $rareMedicine->unit_price;}
            return response()->json([
                'status' => true,
                'message' => 'Rare medicine added successfully',
                'data' => $rareMedicine
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error adding rare medicine: ' . $e->getMessage(),
                'data_sent' => $request->all()
            ], 500);
        }
    }
    //get rare medicines belongs to the logged in user
    public function getRareMedicines(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }
            $rareMedicines = DB::table('rare_medicine')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            $rareMedicines = $rareMedicines->map(function ($medicine) {
                $medicine->unit_price = (float) $medicine->unit_price;
                return $medicine;
            });
            return response()->json([
                'status' => true,
                'data' => $rareMedicines
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching rare medicines: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getRareMedicine(Request $request, $id)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }
            $rareMedicine = DB::table('rare_medicine') //only one object is return
                ->where('rare_id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$rareMedicine) {
                return response()->json([
                    'status' => false,
                    'message' => 'Rare medicine not found'
                ], 404);
            }

            $rareMedicine->unit_price = (float) $rareMedicine->unit_price;
            return response()->json([
                'status' => true,
                'data' => $rareMedicine
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching rare medicine: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateRareMedicine(Request $request, $id)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }
            $validator = Validator::make($request->all(), [
                'medicine_name' => 'sometimes|required|string|max:255',
                'quantity' => 'sometimes|required|integer|min:1',
                'dosage_form' => 'sometimes|required|string|max:50',
                'strength' => 'sometimes|required|max:50',
                'unit_price' => 'sometimes|required|numeric|min:0.01',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }
            $rareMedicine = DB::table('rare_medicine') //query the table
                ->where('rare_id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$rareMedicine) {
                return response()->json([
                    'status' => false,
                    'message' => 'Rare medicine not found or unauthorized'
                ], 404);
            }
            $data = $request->only
            ([
                'medicine_name','quantity','dosage_form','strength','unit_price'
            ]);

            $data['updated_at'] = now();
            $updated = DB::table('rare_medicine')
                ->where('rare_id', $id)
                ->update($data);

            if ($updated) {
                $updatedMedicine = DB::table('rare_medicine')
                    ->where('rare_id', $id)
                    ->first();

                $updatedMedicine->unit_price = (float) $updatedMedicine->unit_price;

                return response()->json([
                    'status' => true,
                    'message' => 'Rare medicine updated successfully',
                    'data' => $updatedMedicine
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Failed to update rare medicine'
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error updating rare medicine: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteRareMedicine(Request $request, $id)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }
$rareMedicine = DB::table('rare_medicine')
                ->where('rare_id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$rareMedicine) {
                return response()->json([
                    'status' => false,
                    'message' => 'Rare medicine not found or unauthorized'
                ], 404);
            }
            $deleted = DB::table('rare_medicine')
                ->where('rare_id', $id)
                ->delete();

            if ($deleted) {
                return response()->json([
                    'status' => true,
                    'message' => 'Rare medicine deleted successfully',
                    'deleted_id' => $id
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Failed to delete rare medicine'
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error deleting rare medicine: ' . $e->getMessage()
            ], 500);
        }
    }

    public function searchRareMedicines(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }
            $searchTerm = $request->input('search', '');
            $limit = $request->input('limit', 20);

            $query = DB::table('rare_medicine')
                ->where('user_id', $user->id);

            if (!empty($searchTerm)) {
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('medicine_name', 'like', '%' . $searchTerm . '%')
                      ->orWhere('dosage_form', 'like', '%' . $searchTerm . '%')
                      ->orWhere('strength', 'like', '%' . $searchTerm . '%');
                });
            }

            $rareMedicines = $query->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            $rareMedicines = $rareMedicines->map(function ($medicine) {
                $medicine->unit_price = (float) $medicine->unit_price;
                return $medicine;
            });

            return response()->json([
                'status' => true,
                'data' => $rareMedicines,
                'total' => $rareMedicines->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error searching rare medicines: ' . $e->getMessage()
            ], 500);
        }
    }

public function searchRareMedicinesAll(Request $request)
{
    try {
   $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $searchTerm = $request->input('search', '');
        $limit = $request->input('limit', 50);

        $query = DB::table('rare_medicine')
            ->join('users', 'rare_medicine.user_id', '=', 'users.id')
            ->leftJoin('pharmacies', function ($join) {
                $join->on('users.pharmacy_id', '=', 'pharmacies.id')
                     ->orWhere(function ($q) {
                         $q->whereRaw('users.pharmacist_name = pharmacies.pharmacist_name')
                           ->orWhereRaw('users.slmc_reg_no = pharmacies.slmc_reg_no');
                     });
            })
            ->select(
                'rare_medicine.rare_id','rare_medicine.medicine_name','rare_medicine.quantity','rare_medicine.dosage_form',
                'rare_medicine.strength','rare_medicine.unit_price', 'rare_medicine.created_at','rare_medicine.updated_at',

                'users.pharmacist_name as user_pharmacist_name','users.slmc_reg_no as user_slmc_reg_no','users.contact_no',
                'users.email','users.pharmacy_id',

                'pharmacies.pharmacy_name','pharmacies.address','pharmacies.district','pharmacies.moh',
                'pharmacies.pharmacist_name as pharmacy_pharmacist_name',
                'pharmacies.slmc_reg_no as pharmacy_slmc_reg_no'
            );

        if (!empty($searchTerm)) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('rare_medicine.medicine_name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('rare_medicine.dosage_form', 'like', '%' . $searchTerm . '%')
                  ->orWhere('rare_medicine.strength', 'like', '%' . $searchTerm . '%');
            });
        }
        //execute query
        $rareMedicines = $query->orderBy('rare_medicine.created_at', 'desc')
            ->limit($limit)
            ->get();

        if ($rareMedicines->count() > 0) {
            $firstResult = (array) $rareMedicines->first();
        }
        //process results
        $rareMedicines = $rareMedicines->map(function ($medicine) {
            $medicine->unit_price = (float) $medicine->unit_price;
            $medicine->total_value = (float) ($medicine->quantity * $medicine->unit_price);

            //use pharmacy details if available otherwise use user details
            if (!empty($medicine->pharmacy_name)) {
                $medicine->display_pharmacy_name = $medicine->pharmacy_name;
                $medicine->display_address = $medicine->address;
                $medicine->display_district = $medicine->district;
                $medicine->display_moh = $medicine->moh;
                $medicine->display_pharmacist_name = $medicine->pharmacy_pharmacist_name ?? $medicine->user_pharmacist_name;
                $medicine->display_slmc_reg_no = $medicine->pharmacy_slmc_reg_no ?? $medicine->user_slmc_reg_no;
            } else {
                $medicine->display_pharmacy_name = null;
                $medicine->display_address = null;
                $medicine->display_district = null;
                $medicine->display_moh = null;
                $medicine->display_pharmacist_name = $medicine->user_pharmacist_name;
                $medicine->display_slmc_reg_no = $medicine->user_slmc_reg_no;
            }
            unset($medicine->user_pharmacist_name); //prevent data duplication
            unset($medicine->user_slmc_reg_no);
            unset($medicine->pharmacy_pharmacist_name);
            unset($medicine->pharmacy_slmc_reg_no);

            $medicine->pharmacist_name = $medicine->display_pharmacist_name;
            $medicine->slmc_reg_no = $medicine->display_slmc_reg_no;

            unset($medicine->display_pharmacist_name); //standard fields Remove the temporary display fields
            unset($medicine->display_slmc_reg_no);

            return $medicine;
        });
        return response()->json([
            'status' => true,
            'data' => $rareMedicines,
            'total' => $rareMedicines->count(),
            'message' => 'Search completed successfully'
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'status' => false,
            'message' => 'Error searching rare medicines: ' . $e->getMessage()
        ], 500);
    }
}
}


