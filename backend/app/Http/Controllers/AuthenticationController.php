<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AuthenticationController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name'      => 'required|string|max:255',
            'last_name'       => 'required|string|max:255',
            'email'           => 'required|email|unique:users,email',
            'password'        => 'required|string|min:6|confirmed',
            'user_type'       => 'required|in:general_user,pharmacist,nmra_official',
            'pharmacist_name' => 'required_if:user_type,pharmacist|string',
            'slmc_reg_no'     => 'required_if:user_type,pharmacist|string',
            'contact_no'      => 'required_if:user_type,pharmacist|string',
            'license'         => 'required_if:user_type,pharmacist|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'nmra_id'         => 'required_if:user_type,nmra_official|string',
        ]);

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

        $userData = [
            'first_name'      => $request->first_name,
            'last_name'       => $request->last_name,
            'email'           => $request->email,
            'password'        => Hash::make($request->password),
            'user_type'       => $request->user_type,
            'pharmacist_name' => $request->pharmacist_name ?? null,
            'slmc_reg_no'     => $request->slmc_reg_no ?? null,
            'contact_no'      => $request->contact_no ?? null,
            'license_image'   => $licensePath,
            'nmra_id'         => $request->nmra_id ?? null,
            'pharmacist_status' => $request->user_type === 'pharmacist' ? 'pending' : null,
        ];

        if ($request->user_type === 'pharmacist') {
            $userData['pharmacist_status'] = 'pending';
        }
        $user = User::create($userData);
        return response()->json([
            'status' => true,
            'message' => $request->user_type === 'pharmacist'
                ? 'Registration successful. Your account is pending approval from NMRA officials.'
                : 'Registration successful',
            'user' => $user
        ], 201);
    }

    public function authenticate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
if (Auth::attempt($request->only('email', 'password'))) {
                $user = Auth::user();

                if ($user->user_type === 'pharmacist' && $user->pharmacist_status !== 'approved') {
                    Auth::logout();

                    return response()->json([
                        'status' => false,
                        'message' => 'Your account is pending approval from NMRA officials. Please wait for approval.'
                    ], 401);
                }
                $token = $user->createToken('auth_token')->plainTextToken;
                return response()->json([
                    'status' => true,
                    'message' => 'Login successful',
                    'user' => [
                        'id' => $user->id,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'email' => $user->email,
                        'user_type' => $user->user_type,
                        'pharmacist_status' => $user->pharmacist_status,
                        'pharmacist_name' => $user->pharmacist_name,
                    ],
                    'token' => $token
                ]);
            }

            return response()->json([
                'status' => false,
                'message' => 'Invalid credentials'
            ], 401);

        } catch (\Exception $e) {

            return response()->json([
                'status' => false,
                'message' => 'Login failed. Please try again.'
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'status' => true,
                'message' => 'Logout successful'
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'status' => false,
                'message' => 'Logout failed'
            ], 500);
        }
    }

    public function getUser(Request $request)
    {
        try {
            $user = $request->user();

            return response()->json([
                'status' => true,
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'user_type' => $user->user_type,
                    'pharmacist_status' => $user->pharmacist_status,
                    'pharmacist_name' => $user->pharmacist_name,
                    'contact_no' => $user->contact_no,
                ]
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'status' => false,
                'message' => 'Failed to get user data'
            ], 500);
        }
    }
}
