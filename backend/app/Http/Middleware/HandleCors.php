<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    public function handle(Request $request, Closure $next): Response
    {
        $allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:3000', // Add if using different port
        ];

        $origin = $request->headers->get('Origin');

        // For development, allow any origin
        if (app()->environment('local') && $origin) {
            $allowedOrigins[] = $origin;
        }

        $headers = [
            'Access-Control-Allow-Origin' => in_array($origin, $allowedOrigins) ? $origin : (app()->environment('local') ? $origin : $allowedOrigins[0]),
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept, X-XSRF-TOKEN, Origin',
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Max-Age' => '86400',
            'Access-Control-Expose-Headers' => 'Authorization, X-CSRF-TOKEN',
        ];

        // Handle preflight requests
        if ($request->isMethod('OPTIONS')) {
            return response()->json(['method' => 'OPTIONS'], 200, $headers);
        }

        $response = $next($request);

        // Add CORS headers to the response
        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value);
        }

        return $response;
    }
}
