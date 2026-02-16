<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PharmacyController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('pharmacies');

            if ($request->has('district') && $request->district != '') {
                $query->where('district', 'like', "%{$request->district}%");
            }

            if ($request->has('moh') && $request->moh != '') {
                $query->where('moh', 'like', "%{$request->moh}%");
            }

            if ($request->has('search') && $request->search != '') {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('pharmacy_name', 'like', "%{$search}%")
                       ->orWhere('district', 'like', "%{$search}%")
                      ->orWhere('pharmacist_name', 'like', "%{$search}%");
                });
            }
            $pharmacies = $query->get();

            //transform the data to ensure proper JSON structure
            $transformed = $pharmacies->map(function ($item) {
                return [
                    'pharmacy_name' => $item->pharmacy_name,
                    'address' => $item->address,
                    'pharmacist_name' => $item->pharmacist_name,

                    'district' => $item->district,
                    'lat' => $item->lat,
                    'lng' => $item->lng,
                    'latitude' => is_numeric($item->lat) ? (float)$item->lat : null,
                    'longitude' => is_numeric($item->lng) ? (float)$item->lng : null,
                ];
            });
            return response()->json($transformed);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server Error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
