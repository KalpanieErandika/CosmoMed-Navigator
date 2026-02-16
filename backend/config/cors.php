<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'], // Apply CORS only to API routes
    'allowed_methods' => ['*'], // Allow all methods: GET, POST, etc.
    'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000'], // Your React app URL
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'], // Allow all headers
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // Allows cookies or auth headers
];

