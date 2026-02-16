<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ProductSearchController;
use App\Http\Controllers\EntitySearchController;
use App\Http\Controllers\NMRAController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\EntityController;
use App\Http\Controllers\RareDrugsController;
use App\Http\Controllers\OCRController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\PharmacyController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\PharmacistContactController;
use App\Http\Controllers\PharmacistDashboardController;


Route::post('authenticate', [AuthenticationController::class, 'authenticate']);
Route::post('register', [RegisterController::class, 'register']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
Route::post('/chat', [ChatController::class, 'chat']);
Route::get('/search-products', [ProductSearchController::class, 'search']);
Route::get('/search-entities', [EntitySearchController::class, 'search']);

Route::get('/pharmacies', [PharmacyController::class, 'index']);

//OCR
Route::post('/analyze-prescription', [OCRController::class, 'analyzePrescription']);

Route::get('/sanctum/csrf-cookie', function () {
    return response()->noContent();
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthenticationController::class, 'logout']);

    Route::prefix('pharmacist')->group(function () {
        Route::put('/contact', [PharmacistContactController::class, 'updateContactApi']);
            Route::get('/rare-medicines/search', [RareDrugsController::class, 'searchRareMedicines']);
    });

Route::middleware('auth:sanctum')->prefix('pharmacist')->group(function () {
    Route::get('/dashboard/order-counts',
        [PharmacistDashboardController::class, 'orderCounts']);
    Route::get('/dashboard/orders-per-day',
     [PharmacistDashboardController::class, 'ordersPerDay']);
    Route::get('/dashboard/orders',
        [PharmacistDashboardController::class, 'orders']);

    Route::post('/orders/{id}/approve',
        [PharmacistDashboardController::class, 'approve']);
    Route::post('/orders/{id}/reject',
        [PharmacistDashboardController::class, 'reject']);
});

    //prescription
    Route::post('/prescriptions/upload', [PrescriptionController::class, 'upload']);
    Route::get('/prescriptions/{id}', [PrescriptionController::class, 'show']);
    Route::get('/prescriptions/{id}/image', [PrescriptionController::class, 'getImage']);

    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/complaints', [ComplaintController::class, 'index']);
    Route::put('/complaints/{id}/status', [ComplaintController::class, 'updateStatus']);

    //orders
    Route::post('/orders', [OrderController::class, 'placeOrder']);
    Route::get('/orders/my-orders', [OrderController::class, 'getUserOrders']);
    Route::get('/customer/orders/{id}', [OrderController::class, 'getOrderDetails']);

    //rare medicines
    Route::post('/pharmacist/rare-medicines/add', [RareDrugsController::class, 'addRareMedicine']);
    Route::get('/pharmacist/rare-medicines', [RareDrugsController::class, 'getRareMedicines']);
    Route::put('/pharmacist/rare-medicines/{id}', [RareDrugsController::class, 'updateRareMedicine']);
    Route::delete('/pharmacist/rare-medicines/{id}', [RareDrugsController::class, 'deleteRareMedicine']);

    Route::get('/rare-medicines/statistics', [RareDrugsController::class, 'getStatistics']);
    Route::get('/rare-medicines/search-all', [RareDrugsController::class, 'searchRareMedicinesAll']);

    //product management
    Route::post('/products/add', [ProductController::class, 'addProduct']);
    Route::get('/products/{type}', [ProductController::class, 'getProductsByType']);
    Route::put('/products/{type}/{id}', [ProductController::class, 'updateProduct']);
    Route::delete('/products/{type}/{id}', [ProductController::class, 'deleteProduct']);

    //entity management
    Route::post('/entities/add', [EntityController::class, 'addEntity']);
    Route::get('/entities/{type}', [EntityController::class, 'getEntitiesByType']);
    Route::put('/entities/{type}/{id}', [EntityController::class, 'updateEntity']);
    Route::delete('/entities/{type}/{id}', [EntityController::class, 'deleteEntity']);

    //NMRA
    Route::prefix('nmra')->group(function () {
        Route::get('/pending-pharmacists', [NMRAController::class, 'getPendingPharmacists']);
        Route::get('/approved-pharmacists', [NMRAController::class, 'getApprovedPharmacists']);
        Route::get('/rejected-pharmacists', [NMRAController::class, 'getRejectedPharmacists']);
        Route::post('/pharmacist/{id}/approve', [NMRAController::class, 'approvePharmacist']);
        Route::post('/pharmacist/{id}/reject', [NMRAController::class, 'rejectPharmacist']);
        Route::get('/search-approved-pharmacists', [NMRAController::class, 'searchApprovedPharmacists']);
        Route::post('/pharmacist/{id}/revoke-approved', [NMRAController::class, 'revokePharmacistApproval']);

        //reports
        Route::prefix('reports')->group(function () {
            Route::get('/', [ReportController::class, 'index']);
            Route::post('/generate', [ReportController::class, 'generate']);
            Route::get('/{id}/download', [ReportController::class, 'downloadReport']);
            Route::get('/test-auth', [ReportController::class, 'testAuth']);
            Route::delete('/{id}', [ReportController::class, 'destroy']);
        });

    Route::get('/nmra/dashboard/product-counts', [DashboardController::class, 'getProductCounts']);
    Route::get('/nmra/products/medicines/count', [DashboardController::class, 'getMedicinesCount']);
    Route::get('/nmra/products/cosmetics/count', [DashboardController::class, 'getCosmeticsCount']);
    Route::get('/nmra/products/borderline/count', [DashboardController::class, 'getBorderlineCount']);
    Route::get('/nmra/products/narcotics/count', [DashboardController::class, 'getNarcoticsCount']);
    Route::get('/nmra/products/precursors/count', [DashboardController::class, 'getPrecursorsCount']);
    Route::get('/nmra/products/psychotropics/count', [DashboardController::class, 'getPsychotropicsCount']);
});


    //pharmacist order management
    Route::prefix('pharmacist')->group(function () {
        Route::get('/orders/pending', [OrderController::class, 'getPharmacistPendingOrders']);
        Route::get('/orders/approved', [OrderController::class, 'getPharmacistApprovedOrders']);
        Route::get('/orders/rejected', [OrderController::class, 'getPharmacistRejectedOrders']);
        Route::get('/orders/{id}', [OrderController::class, 'getOrderDetails']);
        Route::post('/orders/{id}/approve', [OrderController::class, 'approveOrder']);
        Route::post('/orders/{id}/reject', [OrderController::class, 'rejectOrder']);
        Route::get('/orders', [OrderController::class, 'getPharmacistOrders']);
        Route::get('/orders/all', [OrderController::class, 'getAllPharmacistOrders']);
    });

    //notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    });

});

//fallback route for undefined endpoints
Route::fallback(function () {
    return response()->json([
        'status' => false,
        'message' => 'Endpoint not found.'
    ], 404);
});
