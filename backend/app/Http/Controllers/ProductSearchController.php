<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductSearchController extends Controller
{
    public function search(Request $request)
    {
        $type = $request->input('type') ;
        $query = $request->input('query');

        switch ($type) {
            case 'Medicines':
                $results = DB::table('medicines_1')
                    ->where('brand_name', 'LIKE', "%{$query}%")
                    ->orWhere('generic_name', 'LIKE', "%{$query}%")
                    ->select(
                        'brand_name', 'generic_name', 'dosage', 'pack_type', 'pack_size',
                        'Manufacturer','country_code', 'local_agent', 'dossier_no', 'Schedule',
                        'registration_no', 'date_of_registration', 'validity_period'
                    )
                    ->get();
                break;

            case 'Cosmetics':
                $results = DB::table('cosmetics')
                    ->where('Brand Name', 'LIKE', "%{$query}%")
                    ->orWhere('Generic Name', 'LIKE', "%{$query}%")
                    ->select(
                        'Generic Name as generic_name','Brand Name as brand_name', 'Manufacturer',
                        'COUNTRY as country','Importer','EXPIRY DATE as expiry_date')
                    ->get();
                break;
case 'Borderline Products':
                $results = DB::table('boarderline_products')
                    ->whereRaw("`Product Name` LIKE ?", ["%{$query}%"])
                    ->orWhereRaw("`Brand Name` LIKE ?", ["%{$query}%"])
                    ->select(
                        DB::raw("`Product Name` as product_name"),
                        DB::raw("`Brand Name` as brand_name"),
                        DB::raw("`Dosage Form` as dosage_form"),
                        DB::raw("`Importer Name` as importer_name"),
                        DB::raw("`Manufacturer` as manufacturer"),
                        DB::raw("`Manufactured  Country` as manufactured_country"),
                        DB::raw("`Schedule` as schedule")
                    )
                    ->get();
                break;

                 case 'Narcotic Drugs':
                $results = DB::table('narcotic_drugs')
                    -> where('Name', 'LIKE', "%{$query}%")

                    -> select(
                        'Name as name',
                        'ApprovedDosage as approved_dosage'
                    )
                    -> get();
                break;

                 case 'Psychotropic Substances':
                $results = DB::table('psychotropic_substances')
                    -> where('Name', 'LIKE', "%{$query}%")

                    ->select(
              'Name as name',
                        'ApprovedDosage as approved_dosage'
                    )
                    ->get();
                break;

                 case 'Precursor Chemicals':
                $results = DB::table('precursor_chemicals')
                    ->where('Name', 'LIKE', "%{$query}%")
                    ->select(
                        'Name as name','HS Code','CAS No',)
                    ->get();
                break;

            default:
                return response()->json(['error' => 'Invalid product type'], 400);
        }
        return response()->json($results);
    }
}
