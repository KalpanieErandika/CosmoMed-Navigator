<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class PharmacistApprovalController extends Controller
{

    public function getPendingPharmacists()
    {
        $pendingPharmacists = User::pendingPharmacists()
            ->with('pharmacy')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $pendingPharmacists
        ]);
    }

    // Approve a pharmacist
    public function approvePharmacist(Request $request, $id)
    {
        $pharmacist = User::where('user_type', 'pharmacist')->findOrFail($id);

        $pharmacist->update([
            'pharmacist_status' => 'approved',
            'approved_by' => Auth::id(), // The NMRA official who approved
            'approved_at' => now(),
        ]);
        return response()->json([
            'status' => true,
            'message' => 'Pharmacist approved successfully',
            'pharmacist' => $pharmacist
        ]);
    }

    // Reject a pharmacist
    public function rejectPharmacist(Request $request, $id)
    {
        $pharmacist = User::where('user_type', 'pharmacist')->findOrFail($id);

        $pharmacist->update([
            'pharmacist_status' => 'rejected',
            'approved_by' => Auth::id(), // The NMRA official who rejected
            'approved_at' => now(),
        ]);
        return response()->json([
            'status' => true,
            'message' => 'Pharmacist rejected successfully',
            'pharmacist' => $pharmacist
        ]);
    }

    // Get approved pharmacists
    public function getApprovedPharmacists()
    {
        $approvedPharmacists = User::approvedPharmacists()
            ->with(['pharmacy', 'approvedBy'])
            ->get();

        return response()->json([
            'status' => true,
            'data' => $approvedPharmacists
        ]);
    }
}
