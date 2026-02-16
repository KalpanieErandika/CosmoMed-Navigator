<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    // Get pharmacists by status
    private function getPharmacistsByStatus($status)
    {
        return DB::table('users')
            ->where('user_type', 'pharmacist')
            ->where('pharmacist_status', $status)
            ->get();
    }

    public function getPendingPharmacists()
    {
        try {
            $pending = $this->getPharmacistsByStatus('pending');

            return response()->json([
                'success' => true,
                'data' => $pending
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getApprovedPharmacists()
    {
        try {
            $approved = $this->getPharmacistsByStatus('approved');

            return response()->json([
                'success' => true,
                'data' => $approved
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getRejectedPharmacists()
    {
        try {
            $rejected = $this->getPharmacistsByStatus('rejected');

            return response()->json([
                'success' => true,
                'data' => $rejected
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getRevokedPharmacists()
    {
        try {
            $revoked = $this->getPharmacistsByStatus('revoked');

            return response()->json([
                'success' => true,
                'data' => $revoked
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
