<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');

});

// In routes/web.php
Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->noContent();
});
