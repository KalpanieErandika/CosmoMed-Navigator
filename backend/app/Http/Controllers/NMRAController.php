<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\PharmacistApproved;
use App\Mail\PharmacistRejected;
use App\Mail\PharmacistAccountRevoked;

class NMRAController extends Controller
{
    //get all pending requests
    public function getPendingPharmacists(Request $request)
    {
        try {
            if (!Auth::check()) { //check if the user logged in
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            if (Auth::user()->user_type !== 'nmra_official') {
                return response()->json([
                    'status' => false,
                    'message' => 'Access denied. NMRA officials only.'
                ], 403);
            }

            $pending = User::where('user_type', 'pharmacist')
                          ->where('pharmacist_status', 'pending')
                          ->get();

            return response()->json([
                'status' => true,
                'data' => $pending,
                'count' => $pending->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    //get approved requests
    public function getApprovedPharmacists(Request $request)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            if (Auth::user()->user_type !== 'nmra_official') {
                return response()->json([
                    'status' => false,
                    'message' => 'Access denied. NMRA officials only.'
                ], 403);
            }

            $approved = User::where('user_type', 'pharmacist')
                           ->where('pharmacist_status', 'approved')
                           ->orderBy('approved_at', 'desc')
                           ->get();

            return response()->json([
                'status' => true,
                'data' => $approved,
                'count' => $approved->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    //get all rejected requests
    public function getRejectedPharmacists(Request $request)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            if (Auth::user()->user_type !== 'nmra_official') {
                return response()->json([
                    'status' => false,
                    'message' => 'Access denied. NMRA officials only.'
                ], 403);
            }

            $rejected = User::where('user_type', 'pharmacist')
                           ->where('pharmacist_status', 'rejected')
                           ->orderBy('approved_at', 'desc')
                           ->get();

            return response()->json([
                'status' => true,
                'data' => $rejected,
                'count' => $rejected->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    // Approve pharmacist
    public function approvePharmacist(Request $request, $id)
    {
        try {
            if (!Auth::check()) {
                return response()->json(['status' => false, 'message' => 'Unauthenticated.'], 401);
            }

            if (Auth::user()->user_type !== 'nmra_official') {
                return response()->json(['status' => false, 'message' => 'Access denied. NMRA officials only.'], 403);
            }

            $pharmacist = User::where('user_type', 'pharmacist')->find($id);
            if (!$pharmacist) {
                return response()->json(['status' => false, 'message' => 'Pharmacist not found'], 404);
            }

            $pharmacist->update([
                'pharmacist_status' => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            try {
                Mail::to($pharmacist->email)->send(new PharmacistApproved($pharmacist));

            } catch (\Exception $e) {
                Log::error('Failed to send approval email', [
                    'pharmacist_id' => $pharmacist->id,
                    'email' => $pharmacist->email,
                    'error' => $e->getMessage()
                ]);
            }
            return response()->json(['status' => true, 'message' => 'Pharmacist approved successfully']);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    //reject pharmacist
public function rejectPharmacist(Request $request, $id)
{
    try {
        if (!Auth::check()) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated.'], 401);
        }

        if (Auth::user()->user_type !== 'nmra_official') {
            return response()->json(['status' => false, 'message' => 'Access denied. NMRA officials only.'], 403);
        }

        $pharmacist = User::where('user_type', 'pharmacist')->find($id);
        if (!$pharmacist) {
            return response()->json(['status' => false, 'message' => 'Pharmacist not found'], 404);
        }

        $reason = $request->input('reason', 'Application did not meet requirements.');

        $pharmacist->update([
            'pharmacist_status' => 'rejected',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'rejection_reason' => $reason,
        ]);

        try {
            Mail::to($pharmacist->email)->send(new PharmacistRejected($pharmacist, $reason));

        } catch (\Exception $e) {
            Log::error('Failed to send rejection email', [
                'pharmacist_id' => $pharmacist->id,
                'email' => $pharmacist->email,
                'error' => $e->getMessage()
            ]);
        }
        return response()->json(['status' => true, 'message' => 'Pharmacist rejected successfully']);

    } catch (\Exception $e) {
        return response()->json(['status' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
    }
}

    public function revokePharmacistApproval(Request $request, $id)
    {
        try {
            if (!Auth::check()) {
                return response()->json(['status' => false, 'message' => 'Unauthenticated.'], 401);
            }

            if (Auth::user()->user_type !== 'nmra_official') {
                return response()->json(['status' => false, 'message' => 'Access denied. NMRA officials only.'], 403);
            }

            $pharmacist = User::where('user_type', 'pharmacist')->find($id);
            if (!$pharmacist) {
                return response()->json(['status' => false, 'message' => 'Pharmacist not found'], 404);
            }

            //check if pharmacist is approved
            if ($pharmacist->pharmacist_status !== 'approved') {
                return response()->json([
                    'status' => false,
                    'message' => 'Only approved pharmacist accounts can be revoked'
                ], 400);
            }
            $reason = $request->input('reason', 'Account approval has been revoked.');

            $pharmacist->update([
                'pharmacist_status' => 'revoked',
                'revoked_by' => Auth::id(),
                'revoked_at' => now(),
                'revocation_reason' => $reason,
                'original_approved_by' => $pharmacist->approved_by,
                'original_approved_at' => $pharmacist->approved_at,
            ]);
            try {
                Mail::to($pharmacist->email)->send(new PharmacistAccountRevoked($pharmacist, $reason));

            } catch (\Exception $e) {
                Log::error('Failed to send revocation email', [
                    'pharmacist_id' => $pharmacist->id,
                    'email' => $pharmacist->email,
                    'error' => $e->getMessage()
                ]);
            }

            return response()->json([
                'status' => true,
                'message' => 'Pharmacist account approval revoked successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
    //get revoked pharmacist accounts
    public function getRevokedPharmacists(Request $request)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            if (Auth::user()->user_type !== 'nmra_official') {
                return response()->json([
                    'status' => false,
                    'message' => 'Access denied. NMRA officials only.'
                ], 403);
            }

            $revoked = User::where('user_type', 'pharmacist')
                          ->where('pharmacist_status', 'revoked')
                          ->orderBy('revoked_at', 'desc')
                          ->get();

            return response()->json([
                'status' => true,
                'data' => $revoked,
                'count' => $revoked->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Error in getRevokedPharmacists: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function searchApprovedPharmacists(Request $request)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            if (Auth::user()->user_type !== 'nmra_official') {
                return response()->json([
'status' => false,
                    'message' => 'Access denied. NMRA officials only.'
                ], 403);
            }
            $searchTerm = $request->input('search', '');

            if (empty($searchTerm)) {
                return response()->json([
                    'status' => true,
                    'data' => [],
                    'message' => 'Please enter a search term'
                    ]);}

            $pharmacists = User::where('user_type', 'pharmacist')
                ->where('pharmacist_status', 'approved')
                ->where(function($query) use ($searchTerm) {
                    $query->where('pharmacist_name', 'LIKE', "%{$searchTerm}%")
                          ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                          ->orWhere('slmc_reg_no', 'LIKE', "%{$searchTerm}%")
                          ->orWhere('first_name', 'LIKE', "%{$searchTerm}%")
                          ->orWhere('last_name', 'LIKE', "%{$searchTerm}%");
                })
                ->orderBy('pharmacist_name')
                ->get();

            return response()->json([
                'status' => true,
                'data' => $pharmacists,
                'count' => $pharmacists->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

}
