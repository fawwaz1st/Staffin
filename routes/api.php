<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes with Sanctum middleware
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    // Dashboard endpoints
    Route::middleware('role:admin')->group(function () {
        Route::get('/dashboard/admin/summary', [DashboardController::class, 'adminSummary']);
    });
    
    Route::get('/dashboard/employee/summary', [DashboardController::class, 'employeeSummary']);
    
    // Admin-only Shift Management (rate limited)
    Route::middleware(['role:admin', 'throttle:100,1'])->group(function () {
        Route::apiResource('shifts', ShiftController::class);
        Route::get('/shifts/available-employees', [ShiftController::class, 'getAvailableEmployees']);
        // Simple users listing for admin (used by Shift form to pick employees)
        Route::get('/users', function (Request $request) {
            $role = $request->query('role');
            $query = User::query()->select('id', 'name', 'email', 'role');
            if ($role) { $query->where('role', $role); }
            return response()->json($query->orderBy('name')->get());
        });

        // Stubs for future admin features
        Route::get('/leaves', function () {
            return response()->json([
                'data' => [],
                'meta' => ['total' => 0],
            ]);
        });
        Route::get('/payrolls', function () {
            return response()->json([
                'data' => [],
                'meta' => ['total' => 0],
            ]);
        });

        // Admin - User Management
        Route::get('/admin/users', [AdminUserController::class, 'index']);
        Route::get('/admin/users/summary', [AdminUserController::class, 'summary']);
        Route::patch('/admin/users/{user}/approve', [AdminUserController::class, 'approve']);
        Route::patch('/admin/users/{user}/reject', [AdminUserController::class, 'reject']);
        Route::patch('/admin/users/{user}/role', [AdminUserController::class, 'updateRole']);
        Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy']);
    });
    
    // Attendance Prompt 6
    // Employee-only, with rate limiting for clock actions
    Route::middleware(['role:employee'])->group(function () {
        Route::middleware('throttle:5,1')->group(function () {
            Route::post('/attendance/clock-in', [AttendanceController::class, 'clockIn']);
            Route::post('/attendance/clock-out', [AttendanceController::class, 'clockOut']);
        });
        Route::get('/attendance/me', [AttendanceController::class, 'me']);
    });

    // Admin-only attendance listing and export
    Route::middleware('role:admin')->group(function () {
        Route::get('/attendance', [AttendanceController::class, 'adminIndex']);
        Route::get('/attendance/export', [AttendanceController::class, 'export']);
    });

    // Backward compatibility routes (existing UI)
    Route::get('/attendances', [AttendanceController::class, 'me']);
    Route::post('/attendances/clock-in', [AttendanceController::class, 'clockIn']);
    Route::post('/attendances/clock-out', [AttendanceController::class, 'clockOut']);
    Route::get('/attendances/today-status', [AttendanceController::class, 'todayStatus']);
    Route::get('/attendances/monthly-stats', [AttendanceController::class, 'monthlyStats']);

    // Employee Shifts (own schedule)
    Route::middleware('role:employee')->group(function () {
        Route::get('/shifts/my', [ShiftController::class, 'myShifts']);
    });
});
