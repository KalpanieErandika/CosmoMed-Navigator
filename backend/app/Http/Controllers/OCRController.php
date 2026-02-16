<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class OCRController extends Controller
{
    public function analyzePrescription(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120',
        ]);

        if (!$request->hasFile('image'))
            {
            return response()->json(['error' => 'No image uploaded'], 400);}

        $imageFile = $request->file('image');
        $imagePath = $imageFile->getRealPath(); //temporary path on the server

        try {
            $response = Http::attach
            (
                'image', file_get_contents($imagePath), $imageFile->getClientOriginalName()
            )->post(env('PYTHON_API_URL') . '/analyze-prescription');

            if ($response->failed()) {
                return response()->json(['error' => 'Prescription analysis failed'], 500);
            }
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error analyzing prescription: ' . $e->getMessage()
            ], 500);
        }
    }

}
