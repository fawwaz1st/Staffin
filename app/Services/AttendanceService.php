<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\Shift;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttendanceService
{
    private const DEFAULT_PER_PAGE = 15;
    private const MAX_PER_PAGE = 50;
    private const CHUNK_SIZE = 500;

    public function getUserAttendances(User $user, array $filters): LengthAwarePaginator
    {
        $query = Attendance::query()
            ->with(['user', 'shift'])
            ->forUser($user->id);

        if (!empty($filters['start_date'])) {
            $query->whereDate('date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('date', '<=', $filters['end_date']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = (int)($filters['per_page'] ?? self::DEFAULT_PER_PAGE);
        $perPage = max(1, min(self::MAX_PER_PAGE, $perPage));

        return $query->orderByDesc('date')->paginate($perPage);
    }

    /**
     * @return array{attendance: Attendance, time: string}
     * @throws ValidationException
     */
    public function clockIn(User $user, array $payload): array
    {
        $today = Carbon::today();

        $shift = $this->resolveShiftForToday($user, $payload['shift_id'] ?? null, $today);
        if (!$shift) {
            throw ValidationException::withMessages([
                'shift' => 'Anda tidak memiliki jadwal shift hari ini.',
            ]);
        }

        $attendance = Attendance::forUser($user->id)->forDate($today)->first();
        if ($attendance && $attendance->clock_in) {
            throw ValidationException::withMessages([
                'clock_in' => 'Anda sudah melakukan clock in hari ini.',
            ]);
        }

        $clockInTime = Carbon::now();
        $isLate = $shift->start_time ? Carbon::parse($clockInTime)->gt(Carbon::parse($shift->start_time)) : false;

        try {
            $attendance = Attendance::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'date' => $today,
                ],
                [
                    'shift_id' => $shift->id,
                    'clock_in' => $clockInTime,
                    'status' => $isLate ? 'telat' : 'hadir',
                    'notes' => $payload['notes'] ?? null,
                ]
            );
        } catch (QueryException $e) {
            if (($e->errorInfo[1] ?? null) === 1062) {
                $attendance = Attendance::forUser($user->id)->forDate($today)->first();
            } else {
                throw $e;
            }
        }

        $this->writeAuditLog($user->id, 'clock_in', $attendance->id, [
            'time' => $clockInTime->format('H:i'),
            'status' => $attendance->status,
        ]);

        return [
            'attendance' => $attendance,
            'time' => $clockInTime->format('H:i'),
        ];
    }

    /**
     * @return array{attendance: Attendance, time: string, working_hours: float|null}
     * @throws ValidationException
     */
    public function clockOut(User $user, array $payload): array
    {
        $today = Carbon::today();
        $attendance = Attendance::forUser($user->id)->forDate($today)->first();

        if (!$attendance || !$attendance->clock_in) {
            throw ValidationException::withMessages([
                'clock_out' => 'Anda belum melakukan clock in hari ini.',
            ]);
        }

        if ($attendance->clock_out) {
            throw ValidationException::withMessages([
                'clock_out' => 'Anda sudah melakukan clock out hari ini.',
            ]);
        }

        $clockOutTime = Carbon::now();
        $attendance->clock_out = $clockOutTime;
        $attendance->calculateWorkingHours();

        if (!empty($payload['notes'])) {
            $attendance->notes = $payload['notes'];
        }

        $attendance->save();

        $this->writeAuditLog($user->id, 'clock_out', $attendance->id, [
            'time' => $clockOutTime->format('H:i'),
            'working_hours' => $attendance->working_hours,
        ]);

        return [
            'attendance' => $attendance,
            'time' => $clockOutTime->format('H:i'),
            'working_hours' => $attendance->working_hours,
        ];
    }

    public function getTodayStatus(User $user): array
    {
        $today = Carbon::today();
        $shift = Shift::forUser($user->id)->forDate($today)->first();
        $attendance = Attendance::forUser($user->id)->forDate($today)->first();

        $canClockIn = !$attendance || !$attendance->clock_in;
        $canClockOut = $attendance ? $attendance->canClockOut() : false;

        $message = match (true) {
            !$shift => 'Anda tidak memiliki jadwal shift hari ini.',
            $canClockIn => 'Silakan lakukan Clock In saat memulai kerja.',
            $canClockOut => 'Jangan lupa Clock Out saat selesai kerja.',
            default => 'Terima kasih, Anda sudah menyelesaikan absen hari ini.',
        };

        return [
            'status' => $attendance->status ?? ($shift ? 'belum' : 'tidak_terjadwal'),
            'clock_in' => $attendance?->clock_in?->format('H:i'),
            'clock_out' => $attendance?->clock_out?->format('H:i'),
            'working_hours' => $attendance?->working_hours,
            'can_clock_in' => $canClockIn,
            'can_clock_out' => $canClockOut,
            'message' => $message,
            'shift' => $shift ? [
                'start_time' => $shift->start_time,
                'end_time' => $shift->end_time,
                'location' => $shift->location,
                'status' => $shift->status,
            ] : null,
        ];
    }

    public function getMonthlyStats(User $user, int $month, int $year): array
    {
        $attendances = Attendance::forUser($user->id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get();

        $workingDays = $attendances->count();
        $effectiveDays = $attendances->whereIn('status', ['hadir', 'telat'])->count();

        return [
            'working_days' => $workingDays,
            'present_days' => $attendances->where('status', 'hadir')->count(),
            'absent_days' => $attendances->where('status', 'alfa')->count(),
            'leave_days' => $attendances->where('status', 'izin')->count(),
            'total_working_hours' => $attendances->sum('working_hours'),
            'average_daily_hours' => $attendances->where('working_hours', '>', 0)->avg('working_hours'),
            'attendance_rate' => $workingDays ? round(($effectiveDays / $workingDays) * 100, 2) : 0,
        ];
    }

    public function getAdminAttendances(array $filters): LengthAwarePaginator
    {
        $query = Attendance::query()->with(['user', 'shift']);

        if (!empty($filters['user_id'])) {
            $query->where('user_id', (int) $filters['user_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['start_date'])) {
            $query->whereDate('date', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->whereDate('date', '<=', $filters['end_date']);
        }

        $perPage = (int)($filters['per_page'] ?? self::DEFAULT_PER_PAGE);
        $perPage = max(1, min(self::MAX_PER_PAGE, $perPage));

        return $query->orderByDesc('date')->paginate($perPage);
    }

    public function streamExport(array $filters, \Closure $writer): void
    {
        $query = Attendance::query()->with(['user', 'shift']);

        if (!empty($filters['user_id'])) {
            $query->where('user_id', (int) $filters['user_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['start_date'])) {
            $query->whereDate('date', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->whereDate('date', '<=', $filters['end_date']);
        }

        $query->orderByDesc('date')->chunk(self::CHUNK_SIZE, function ($rows) use ($writer) {
            $writer($rows);
        });
    }

    private function resolveShiftForToday(User $user, ?int $shiftId, Carbon $date): ?Shift
    {
        if ($shiftId) {
            return Shift::where('id', $shiftId)
                ->where('user_id', $user->id)
                ->whereDate('date', $date)
                ->first();
        }

        return Shift::forUser($user->id)->forDate($date)->first();
    }

    private function writeAuditLog(int $userId, string $action, int $entityId, array $changes): void
    {
        AuditLog::create([
            'user_id' => $userId,
            'action' => $action,
            'entity' => 'Attendance',
            'entity_id' => $entityId,
            'changes' => $changes,
        ]);
    }
}
