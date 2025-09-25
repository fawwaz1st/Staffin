<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class ShiftService
{
    private const DEFAULT_PER_PAGE = 15;
    private const MAX_PER_PAGE = 50;

    public function paginate(array $filters = []): LengthAwarePaginator
    {
        $query = Shift::with('user');

        if (!empty($filters['date'])) {
            $query->forDate($filters['date']);
        }

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('date', [$filters['start_date'], $filters['end_date']]);
        }

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (!empty($filters['user_id'])) {
            $query->forUser($filters['user_id']);
        }

        if (!empty($filters['q'])) {
            $this->applySearchFilter($query, $filters['q']);
        }

        $perPage = (int)($filters['per_page'] ?? self::DEFAULT_PER_PAGE);
        $perPage = max(1, min(self::MAX_PER_PAGE, $perPage));

        return $query
            ->orderByDesc('date')
            ->orderBy('start_time')
            ->paginate($perPage);
    }

    public function create(User $actor, array $payload): Shift
    {
        $this->assertUniqueAssignment($payload['user_id'] ?? null, $payload['date']);

        try {
            $shift = Shift::create([
                'date' => $payload['date'],
                'start_time' => $payload['start_time'],
                'end_time' => $payload['end_time'],
                'user_id' => $payload['user_id'] ?? null,
                'status' => ($payload['user_id'] ?? null) ? 'assigned' : 'open',
                'location' => $payload['location'] ?? null,
                'notes' => $payload['notes'] ?? null,
            ]);
        } catch (QueryException $e) {
            $this->handleDuplicateAssignment($e);
        }

        $shift->load('user');
        $this->logAudit($actor->id ?? null, 'create', $shift->id, ['new' => $shift->toArray()]);

        return $shift;
    }

    public function update(User $actor, Shift $shift, array $payload): Shift
    {
        $userId = $payload['user_id'] ?? null;
        if ($userId && (int)$userId !== (int)$shift->user_id) {
            $this->assertUniqueAssignment($userId, $payload['date'], $shift->id);
        }

        $original = $shift->replicate();

        try {
            $shift->update([
                'date' => $payload['date'],
                'start_time' => $payload['start_time'],
                'end_time' => $payload['end_time'],
                'user_id' => $userId,
                'status' => $payload['status'],
                'location' => $payload['location'] ?? null,
                'notes' => $payload['notes'] ?? null,
            ]);
        } catch (QueryException $e) {
            $this->handleDuplicateAssignment($e);
        }

        $shift->load('user');
        $this->logAudit($actor->id ?? null, 'update', $shift->id, [
            'old' => $original->toArray(),
            'new' => $shift->toArray(),
        ]);

        return $shift;
    }

    public function delete(User $actor, Shift $shift): void
    {
        $deleted = $shift->replicate();
        $shift->delete();

        $this->logAudit($actor->id ?? null, 'delete', $deleted->id, [
            'old' => $deleted->toArray(),
        ]);
    }

    public function availableEmployees(string $date): Collection
    {
        return User::where('role', 'employee')
            ->whereDoesntHave('shifts', function ($query) use ($date) {
                $query->where('date', $date);
            })
            ->select('id', 'name', 'email')
            ->get();
    }

    public function paginateForUser(User $user, array $filters = []): LengthAwarePaginator
    {
        $query = Shift::with('user')->forUser($user->id);

        if (!empty($filters['date'])) {
            $query->forDate($filters['date']);
        }

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('date', [$filters['start_date'], $filters['end_date']]);
        }

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        $perPage = (int)($filters['per_page'] ?? self::DEFAULT_PER_PAGE);
        $perPage = max(1, min(self::MAX_PER_PAGE, $perPage));

        return $query
            ->orderBy('date')
            ->orderBy('start_time')
            ->paginate($perPage);
    }

    private function applySearchFilter($query, string $term): void
    {
        $query->where(function ($sub) use ($term) {
            $sub->where('location', 'like', "%{$term}%")
                ->orWhereHas('user', function ($uq) use ($term) {
                    $uq->where('name', 'like', "%{$term}%");
                });
        });
    }

    private function assertUniqueAssignment(?int $userId, ?string $date, ?int $ignoreId = null): void
    {
        if (!$userId || !$date) {
            return;
        }

        $exists = Shift::where('user_id', $userId)
            ->where('date', $date)
            ->when($ignoreId, fn ($builder) => $builder->where('id', '!=', $ignoreId))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'user_id' => 'Karyawan sudah memiliki shift pada tanggal ini.',
            ]);
        }
    }

    private function handleDuplicateAssignment(QueryException $exception): void
    {
        if (($exception->errorInfo[1] ?? null) === 1062) {
            throw ValidationException::withMessages([
                'user_id' => 'Karyawan sudah memiliki shift pada tanggal ini.',
            ]);
        }

        throw $exception;
    }

    private function logAudit(?int $actorId, string $action, int $entityId, array $changes): void
    {
        AuditLog::create([
            'user_id' => $actorId,
            'action' => $action,
            'entity' => 'shift',
            'entity_id' => $entityId,
            'changes' => $changes,
        ]);
    }
}
