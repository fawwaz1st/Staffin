<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UserController extends Controller
{
    /**
     * List users with filters and pagination
     */
    public function index(Request $request)
    {
        $admin = $request->user();
        if ($admin->status !== 'approved') {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $query = User::query()->select('id','name','email','role','status','created_at');

        // Filters
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }
        if ($search = $request->query('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min(50, $perPage));

        $users = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Summary counts by status
     */
    public function summary(Request $request)
    {
        $admin = $request->user();
        if ($admin->status !== 'approved') {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $data = [
            'total' => User::count(),
            'pending' => User::where('status','pending')->count(),
            'approved' => User::where('status','approved')->count(),
            'rejected' => User::where('status','rejected')->count(),
        ];

        return response()->json($data);
    }

    public function approve(Request $request, User $user)
    {
        $admin = $request->user();
        if ($admin->status !== 'approved') {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $from = $user->status;
        $user->update(['status' => 'approved']);

        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'approve',
            'entity' => 'user',
            'entity_id' => $user->id,
            'changes' => ['status_from' => $from, 'status_to' => 'approved'],
        ]);

        return response()->json(['message' => 'User disetujui', 'user' => $user]);
    }

    public function reject(Request $request, User $user)
    {
        $admin = $request->user();
        if ($admin->status !== 'approved') {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $from = $user->status;
        $user->update(['status' => 'rejected']);

        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'reject',
            'entity' => 'user',
            'entity_id' => $user->id,
            'changes' => ['status_from' => $from, 'status_to' => 'rejected'],
        ]);

        return response()->json(['message' => 'User ditolak', 'user' => $user]);
    }

    public function updateRole(Request $request, User $user)
    {
        $admin = $request->user();
        if ($admin->status !== 'approved') {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $request->validate([
            'role' => 'required|in:admin,employee',
        ]);

        $from = $user->role;
        $user->update(['role' => $request->role]);

        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'update_role',
            'entity' => 'user',
            'entity_id' => $user->id,
            'changes' => ['role_from' => $from, 'role_to' => $user->role],
        ]);

        return response()->json(['message' => 'Role diperbarui', 'user' => $user]);
    }

    public function destroy(Request $request, User $user)
    {
        $admin = $request->user();
        if ($admin->status !== 'approved') {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        if ($admin->id === $user->id) {
            return response()->json(['message' => 'Tidak dapat menghapus akun sendiri'], 422);
        }

        $userId = $user->id;
        $user->delete();

        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'delete',
            'entity' => 'user',
            'entity_id' => $userId,
            'changes' => null,
        ]);

        return response()->json(['message' => 'User dihapus']);
    }
}
