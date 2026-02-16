<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Pharmacy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $messages = [
            'first_name.required' => 'First name is required.',
            'last_name.required'  => 'Last name is required.',
            'email.required'      => 'Email is required.',
            'email.email'         => 'Invalid email format.',
            'email.unique'        => 'This email address is already registered.',
            'password.required'   => 'Password is required.',
            'password.min'        => 'Password must be at least 6 characters.',
            'password.confirmed'  => 'Passwords do not match.',
            'user_type.required'  => 'User type is required.',
            'user_type.in'        => 'Invalid user type selected.',
            'pharmacist_name.required_if' => 'Pharmacist name is required.',
            'slmc_reg_no.required_if' => 'SLMC registration number is required.',
            'contact_no.required_if' => 'Contact number is required.',
            'license.required_if' => 'Pharmacy license is required.',
            'license.mimes'       => 'License must be a jpg, jpeg, png or pdf file.',
            'nmra_id.required_if' => 'NMRA ID is required.',
            'nmra_id.unique'      => 'This NMRA ID is already registered.'
        ];

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'user_type' => 'required|in:general_user,pharmacist,nmra_official',
            'pharmacist_name' => 'required_if:user_type,pharmacist|string|max:255',
            'slmc_reg_no' => [
                'required_if:user_type,pharmacist',
                function ($attribute, $value, $fail) use ($request) {
                    $existingApproved = User::where('user_type', 'pharmacist')
                        ->where('slmc_reg_no', $value)
                        ->where('pharmacist_status', 'approved')
                        ->exists();

                    if ($existingApproved) {
                        $fail('An approved pharmacist account already exists with this SLMC number.');
                    }
                },
            ],
            'contact_no' => 'required_if:user_type,pharmacist|string|max:20',
            'license' => 'required_if:user_type,pharmacist|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'nmra_id' => 'required_if:user_type,nmra_official|string|max:255|unique:users,nmra_id'
        ], $messages);

$validator->after(function ($validator) use ($request) {
    if ($request->user_type === 'pharmacist' && $request->slmc_reg_no && $request->pharmacist_name) {
        //clean inputs
        $slmcRegNo = trim($request->slmc_reg_no);
        $pharmacistName = trim($request->pharmacist_name);

        // Check the pharmacist name and SLMC number match
        $pharmacyRecord = DB::table('pharmacies')
            ->where('slmc_reg_no', 'like', $slmcRegNo)
            ->where(DB::raw('LOWER(TRIM(pharmacist_name))'), 'like', strtolower($pharmacistName))
            ->first();

        if (!$pharmacyRecord) {
            $validator->errors()->add(
                'slmc_reg_no',
                'The pharmacist name and SLMC registration number do not match our official records. Please verify both fields.'
            );
        }}
        });

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $licensePath = null;

        if ($request->user_type === 'pharmacist' && $request->hasFile('license')) {
            $file = $request->file('license');

            if ($file->isValid()) {
                $licensePath = $file->store('licenses', 'public');
            }
        }

        try {
            //get pharmacy ID if record exists
            $pharmacyId = null;
            if ($request->user_type === 'pharmacist' && $request->slmc_reg_no && $request->pharmacist_name) {
                $pharmacyRecord = DB::table('pharmacies')
                    ->where('slmc_reg_no', $request->slmc_reg_no)
                    ->where('pharmacist_name', $request->pharmacist_name)
                    ->first();

                if ($pharmacyRecord) {
                    $pharmacyId = $pharmacyRecord->id;
                }
            }
            $user = User::create([
                'first_name' => $request->first_name,
                'last_name'  => $request->last_name,
                'email'      => $request->email,
                'password' => Hash::make($request->password),
                'user_type' => $request->user_type,
                'pharmacist_name' => $request->pharmacist_name ?? null,
                'slmc_reg_no'     => $request->slmc_reg_no ?? null,
                'contact_no'      => $request->contact_no ?? null,
                'license_image'   => $licensePath,
                'nmra_id' => $request->nmra_id ?? null,
                'pharmacist_status' => $request->user_type === 'pharmacist' ? 'pending' : 'approved',
              'approved_by' => null,
                'approved_at' => null,
                'pharmacy_id' => $pharmacyId
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Registration successful.',
                'user'    => [
                    'id'    => $user->id,
                    'name'  => $user->first_name . ' ' . $user->last_name,
                    'email' => $user->email,
                    'user_type' => $user->user_type,
                    'pharmacist_status' => $user->pharmacist_status,
                    'pharmacy_id' => $user->pharmacy_id
                ]
            ], 201);

        } catch (\Exception $e) {
   return response()->json([
                'status'  => false,
                'message' => 'Server error during registration.'
            ], 500);
        }
    }
}
