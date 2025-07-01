<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; // Import your AuthController

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes (no authentication required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Buyer Dashboard Routes
    Route::get('/user/preferences', [AuthController::class, 'getUserPreferences']);
    Route::post('/user/preferences', [AuthController::class, 'saveUserPreferences']);

    // Agent Dashboard Routes
    Route::get('/user/listings', [AuthController::class, 'getAgentListings']);
    Route::post('/user/listings', [AuthController::class, 'addAgentListing']);
    Route::delete('/user/listings/{id}', [AuthController::class, 'deleteAgentListing']);

    // --- NEW FEATURE ROUTES ---
    Route::get('/properties', [AuthController::class, 'getAvailableProperties']);
    Route::get('/buyer-intent', [AuthController::class, 'getBuyerIntent']);
    Route::get('/find-agent', [AuthController::class, 'findAgent']);
    Route::get('/manage-reviews', [AuthController::class, 'manageReviews']);
    Route::get('/exclusive-reports', [AuthController::class, 'getExclusiveReports']);
    Route::get('/connect-website', [AuthController::class, 'connectWebsite']);


    // Add other protected routes here for Investor, Vendor, Developer dashboards etc.
    // E.g., Route::get('/investor/data', [InvestorController::class, 'getData']);
});
