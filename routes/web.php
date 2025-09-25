<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordController;

// Sanctum SPA session endpoints (cookie/httpOnly)
Route::post('/session/login', [AuthController::class, 'loginSession']);
Route::post('/session/logout', [AuthController::class, 'logoutSession']);
Route::post('/session/register', [AuthController::class, 'registerSession']);

// Password reset endpoints
Route::post('/password/forgot', [PasswordController::class, 'forgot']);
Route::post('/password/reset', [PasswordController::class, 'reset']);

// Route untuk men-generate URL reset password di email (mengarah ke SPA)
Route::get('/reset-password/{token}', function (string $token) {
    return view('app');
})->name('password.reset');

// React SPA Routes - semua route diarahkan ke app.blade.php (kecuali prefix api)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
