<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PharmacistContactController extends Controller
{
public function getUserDetails(Request $request)
{
    try {
        $userId = Auth::id();
        $userData = DB::table('users')
            ->where('id', $userId)
            ->select(
                'id','first_name','last_name','email','user_type','pharmacist_name','slmc_reg_no',
                'contact_no','pharmacist_status','nmra_id','pharmacy_id')
            ->first();

        if (!$userData) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Build response
        return response()->json([
            'id' => $userData->id,
            'first_name' => $userData->first_name,
            'last_name' => $userData->last_name,
            'email' => $userData->email,
            'user_type' => $userData->user_type,
            'pharmacist_name' => $userData->pharmacist_name,
            'slmc_reg_no' => $userData->slmc_reg_no,
            'contact_no' => $userData->contact_no,
            'pharmacist_status' => $userData->pharmacist_status,
            'nmra_id' => $userData->nmra_id,
            'pharmacy_id' => $userData->pharmacy_id,
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error fetching user details',
            'error' => $e->getMessage() // Remove in production
        ], 500);
    }
}

    public function updateContactApi(Request $request)
    {
        $request->validate([
            'contact_no' => 'required|string|max:15'
        ]);

        $user = Auth::user();
        $user->contact_no = $request->contact_no;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Contact updated successfully',
            'contact_no' => $user->contact_no
        ]);
    }
}
