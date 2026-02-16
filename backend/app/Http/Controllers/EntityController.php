<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EntityController extends Controller
{
    public function addEntity(Request $request)
    {
        $request->validate([
            'entity_type' => 'required',
            'data' => 'required|array',
        ]);
        $table = $request->entity_type;
        $data = $request->data;

        try {
            DB::table($table)->insert($data);

            return response()->json([
                'status' => true,
                'message' => 'Entity added successfully'
            ]);

        } catch (\Exception $e) {
            Log::error("Error adding entity to table {$table}: " . $e->getMessage());

            return response()->json([
                'status' => false,
                'message' => 'Error adding entity: ' . $e->getMessage(),
                'table' => $table,
                'data_sent' => $data
            ], 500);
        }
    }

    public function getEntitiesByType($type)
    {
        try { //get all rows from a table
            $entities = DB::table($type)->get();

            return response()->json([
                'status' => true,
                'data' => $entities
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching entities: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateEntity(Request $request, $type, $id)
    {
        try {
            $data = $request->all();

            //define id column names
            $idColumns = [
                'pharmacies' => 'id',
                'importers' => 'importer_id',
                'exporters' => 'exporter_id',
                'manufacturers' => 'Id',
            ];

            $idColumn = $idColumns[$type] ?? 'id';

            // Remove id column from update data
            unset($data[$idColumn]);

            $updated = DB::table($type)
                ->where($idColumn, $id)
                ->update($data);

            if ($updated) {
                return response()->json([
                    'status' => true,
                    'message' => 'Entity updated successfully',
                    'rows_updated' => $updated
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'No entity found with the given ID or no changes made'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error updating entity: ' . $e->getMessage(),
                'table' => $type,
                'id_column' => $idColumn ?? 'unknown',
                'id' => $id
            ], 500);
        }
    }

    public function deleteEntity($type, $id)
    {
        try {
            // define id column names
            $idColumns = [
                'pharmacies' => 'id',
                'importers' => 'importer_id',
                'exporters' => 'exporter_id',
                'manufacturers' => 'Id',
            ];
            $idColumn = $idColumns[$type] ?? 'id';

            $deleted = DB::table($type)
                ->where($idColumn, $id)
                ->delete();

            if ($deleted) {
                return response()->json([
                    'status' => true,
                    'message' => 'Entity deleted successfully',
                    'rows_deleted' => $deleted
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'No entity found with the given ID'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error deleting entity: ' . $e->getMessage()
            ], 500);
        }
    }
}
