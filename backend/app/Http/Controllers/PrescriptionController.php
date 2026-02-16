<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Prescription;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PrescriptionController extends Controller
{
    public function upload(Request $request)
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
                'prescription_image' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }
            $file = $request->file('prescription_image');

            //store file
            $filePath = null;
            if ($file->isValid()) {
                $filePath = $file->store('prescriptions', 'public');
            }

            $prescription = Prescription::create([
                'user_id' => $user->id,
                'prescription_image' => $filePath,
                'status' => 0, // pending
                'uploaded_at' => now(),
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Prescription uploaded successfully',
                'data' => [
                    'prescription_id' => $prescription->prescription_id,
                    'image_url' => $filePath ? asset('storage/' . $filePath) : null
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error uploading prescription: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getImage($id)
    {
        try {
            $prescription = Prescription::find($id);

            if (!$prescription) {
                return response()->json([
                    'status' => false,
                    'message' => 'Prescription not found'
                ], 404);
            }

            //check if user has permission to view this prescription
            $user = auth()->user();
            if ($prescription->user_id != $user->id && !$user->isAdmin()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized to view this prescription'
                ], 403);
            }

            // Check if file exists
            if (!$prescription->prescription_image ||
                !Storage::disk('public')->exists($prescription->prescription_image)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Prescription file not found'
                ], 404);
            }
            //return the file
            return Storage::disk('public')->response($prescription->prescription_image);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error retrieving prescription image'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $prescription = Prescription::find($id);

            if (!$prescription) {
                return response()->json([
                    'status' => false,
                    'message' => 'Prescription not found'
                ], 404);
            }

            // Check if user has permission
            $user = auth()->user();
            if ($prescription->user_id != $user->id && !$user->isAdmin()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized to view this prescription'
                ], 403);
            }

            return response()->json([
                'status' => true,
                'data' => [
                    'prescription_id' => $prescription->prescription_id,
                    'user_id' => $prescription->user_id,
                    'image_url' => $prescription->prescription_image ?
                                  asset('storage/' . $prescription->prescription_image) : null,
                    'status' => $prescription->status,
                    'uploaded_at' => $prescription->uploaded_at
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error retrieving prescription'
            ], 500);
        }
    }
}
