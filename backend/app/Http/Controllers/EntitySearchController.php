<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EntitySearchController extends Controller
{
    public function search(Request $request)
    {
        $type = trim($request->input('type'));
        $query = trim($request->input('query'));

        switch ($type) {
            case 'Pharmacies':
                $results = DB::table('pharmacies')
                    ->where('pharmacy_name', 'LIKE', "%{$query}%")
                    ->select('file_no','pharmacy_name','address','pharmacist_name','slmc_reg_no as SLMC Registration No','moh as MOH','district')
                    ->get();
                break;

            case 'Drug Manufacturers':
                $results = DB::table('manufacturers')
                    ->where('Name', 'LIKE', "%{$query}%")
                    ->select('Name','SiteAddress','RegisteredOffice','ProductRange','Category')
                    ->get();
                break;

            case 'Importers':
                $results = DB::table('importers')
                    ->where('Name', 'LIKE', "%{$query}%")
                    ->select('Name','Address')
                    ->get();
                break;

            case 'Exporters':
                $results = DB::table('exporters')
                    ->where('Name', 'LIKE', "%{$query}%")
                    ->select('Name','Address')
                    ->get();
                break;
            default:
                return response()->json(['error' => 'Invalid entity type'], 400);
        }

        return response()->json($results);
    }
}
