<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'employee',
            'status' => 'pending',
            'join_date' => now(),
        ]);

        return response()->json([
            'message' => 'Pendaftaran berhasil, menunggu persetujuan admin.',
            'user' => $user,
        ], Response::HTTP_CREATED);
    }

    /**
     * Login user
     */
    public function login(LoginRequest $request)
    {
        $key = 'login.' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => "Terlalu banyak percobaan login. Coba lagi dalam {$seconds} detik.",
            ]);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            RateLimiter::hit($key, 60);
            
            throw ValidationException::withMessages([
                'email' => 'Email atau password salah.',
            ]);
        }

        RateLimiter::clear($key);

        $user = Auth::user();

        if ($user->status !== 'approved') {
            Auth::logout();
            $message = $user->status === 'rejected'
                ? 'Akun Anda ditolak. Hubungi admin untuk informasi lebih lanjut.'
                : 'Akun Anda belum disetujui admin.';
            throw ValidationException::withMessages([
                'email' => $message,
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil',
        ]);
    }

    /**
     * Get current user
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $request->user()->id,
        ]);

        $user = $request->user();
        $user->update($request->only(['name', 'email']));

        return response()->json([
            'message' => 'Profile berhasil diperbarui',
            'user' => $user,
        ]);
    }

    /**
     * Sanctum SPA: Login berbasis sesi (httpOnly cookie)
     */
    public function loginSession(LoginRequest $request)
    {
        $key = 'login.' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => "Terlalu banyak percobaan login. Coba lagi dalam {$seconds} detik.",
            ]);
        }

        $credentials = $request->only('email', 'password');
        $remember = (bool) $request->boolean('remember');

        if (!Auth::attempt($credentials, $remember)) {
            RateLimiter::hit($key, 60);
            throw ValidationException::withMessages([
                'email' => 'Email atau password salah.',
            ]);
        }

        RateLimiter::clear($key);

        $request->session()->regenerate();
        $user = Auth::user();

        if ($user->status !== 'approved') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            $message = $user->status === 'rejected'
                ? 'Akun Anda ditolak. Hubungi admin untuk informasi lebih lanjut.'
                : 'Akun Anda belum disetujui admin.';
            throw ValidationException::withMessages([
                'email' => $message,
            ]);
        }

        return response()->json([
            'message' => 'Login berhasil',
            'user' => $user,
        ]);
    }

    /**
     * Sanctum SPA: Logout berbasis sesi
     */
    public function logoutSession(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout berhasil',
        ]);
    }

    /**
     * Sanctum SPA: Registrasi lalu login berbasis sesi
     */
    public function registerSession(RegisterRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'employee',
            'status' => 'pending',
            'join_date' => now(),
        ]);

        return response()->json([
            'message' => 'Pendaftaran berhasil, menunggu persetujuan admin.',
            'user' => $user,
        ], Response::HTTP_CREATED);
    }
}
