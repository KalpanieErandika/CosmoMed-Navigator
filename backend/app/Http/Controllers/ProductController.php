<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
public function addProduct(Request $request)
{
    $request->validate([
        'product_type' => 'required',
        'data' => 'required|array',
    ]);

    $table = $request->product_type;
    $data = $request->data;

    $idColumns = [
        'medicines_1' => 'medicine_id',
        'cosmetics' => 'cosmetic_id',
        'boarderline_products' => 'boarderline_id',
        'narcotic_drugs' => 'narcotic_id',
        'precursor_chemicals' => 'precusor_id',
        'psychotropic_substances' => 'substance_id',
    ];

    $idColumn = $idColumns[$table] ?? null;

    // Mapping frontend fields to actual DB columns
    $fieldMappings = [
        'medicines_1' => [
            'Genaric Name' => 'generic_name', // fix typo
            'Brand Name' => 'brand_name',
            'Dosage' => 'Dosage',
            'Pack Type' => 'pack_type',
            'Pack Size' => 'pack_size',
            'Manufacturer' => 'Manufacturer',
            'Country code' => 'country_code',
            'Local Agent' => 'local_agent',
            'Dossier No' => 'dossier_no',
            'Schedule' => 'Schedule',
            'Registration No' => 'registration_no',
            'Date of Registration' => 'date_of_registration',
            'Validity Period' => 'validity_period',
        ],
        // Add other tables as needed
    ];

    $dbRow = [];

    foreach ($data as $key => $value) {
        // Skip empty ID column
        if ($idColumn && $key === $idColumn && empty(trim($value))) {
            continue;
        }

        // Map the frontend key to DB column if mapping exists
        $dbKey = $fieldMappings[$table][$key] ?? $key;

        $dbRow[$dbKey] = $value;
    }

    try {
        DB::table($table)->insert($dbRow);

        return response()->json([
            'status' => true,
            'message' => 'Product added successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => false,
            'message' => 'Error adding product: ' . $e->getMessage(),
            'table' => $table,
            'id_column' => $idColumn,
            'data_sent' => $data,
            'db_row' => $dbRow
        ], 500);
    }
}

    public function getProductsByType($type)
    {
        try {
            $products = DB::table($type)->get();

            return response()->json([
                'status' => true,
                'data' => $products
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching products: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateProduct(Request $request, $type, $id)
    {
        try {
            $data = $request->all();
            $idColumns = [
                'medicines_1' => 'medicine_id',
                'cosmetics' => 'cosmetic_id',
                'boarderline_products' => 'boarderline_id',
                'narcotic_drugs' => 'narcotic_id',
                'precursor_chemicals' => 'precusor_id',
                'psychotropic_substances' => 'substance_id',
            ];
$idColumn = $idColumns[$type] ?? 'id';
            //remove the ID column from update data to avoid conflic
            unset($data[$idColumn]);

            $updated = DB::table($type)
                ->where($idColumn, $id)
                ->update($data);

            if ($updated) {
                return response()->json([
                    'status' => true,
                    'message' => 'Product updated successfully',
                    'rows_updated' => $updated
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'No product found with the given ID or no changes made'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error updating product: ' . $e->getMessage(),
                'table' => $type,
                'id_column' => $idColumn ?? 'unknown',
                'id' => $id
            ], 500);
        }
    }

    public function deleteProduct($type, $id)
    {
        try {
            $idColumns = [
                'medicines_1' => 'medicine_id',
                'cosmetics' => 'cosmetic_id',
                'boarderline_products' => 'boarderline_id',
                'narcotic_drugs' => 'narcotic_id',
                'precursor_chemicals' => 'precusor_id',
                'psychotropic_substances' => 'substance_id',
            ];

            $idColumn = $idColumns[$type] ?? 'id';

            $deleted = DB::table($type)
                ->where($idColumn, $id)
                ->delete();

            if ($deleted) {
                return response()->json([
                    'status' => true,
                    'message' => 'Product deleted successfully',
                    'rows_deleted' => $deleted
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'No product found with the given ID'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error deleting product: ' . $e->getMessage()
            ], 500);
        }
    }
}
