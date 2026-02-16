<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pharmacist;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class PharmacistController extends Controller
{
    public function register(Request $request)
    {
        //validate incoming request
        $request->validate([
            'contact_no' => ['required', 'string', 'size:10', 'regex:/^[0-9]{10}$/'],
            'license' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);
        $user = Auth::user();

        //automatically get the pharmacy associated with the user
        $pharmacyId = $user->pharmacy_id ?? null;
        if (!$pharmacyId) {
            return response()->json([
                'message' => 'No pharmacy associated with this user.',
            ], 400);
        }

        //check if pharmacist request already exist
        $existing = Pharmacist::where('user_id', $user->id)->first();
        if ($existing) {
            return response()->json([
                'message' => 'You have already submitted a pharmacist account request.',
                'status' => 'exists'
            ], 409);
        }
        $licensePath = $request->file('license')->store('licenses', 'public');

        $pharmacist = Pharmacist::create([
            'user_id' => $user->id,
            'pharmacy_id' => $pharmacyId,
            'license' => $licensePath,
            'contact_no' => $request->contact_no,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Your account request has been submitted to NMRA for approval.',
            'status' => 'pending',
            'data' => $pharmacist
        ], 201);
    }
}
