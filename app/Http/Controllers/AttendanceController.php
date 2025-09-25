<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttendanceClockInRequest;
use App\Http\Requests\AttendanceClockOutRequest;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttendanceController extends Controller
{
    public function __construct(private readonly AttendanceService $attendanceService)
    {
    }

    /**
     * Employee: attendance history (supports date range + status) with pagination
     */
    public function me(Request $request)
    {
        $attendances = $this->attendanceService->getUserAttendances(
            $request->user(),
            $request->only(['start_date', 'end_date', 'status', 'per_page'])
        );

        return response()->json($attendances);
    }

    /**
     * Clock in for today
     */
    public function clockIn(AttendanceClockInRequest $request)
    {
        $result = $this->attendanceService->clockIn(
            $request->user(),
            $request->only(['shift_id', 'notes'])
        );

        return response()->json([
            'message' => 'Clock in berhasil',
            ...$result,
        ]);
    }

    /**
     * Clock out for today
     */
    public function clockOut(AttendanceClockOutRequest $request)
    {
        $result = $this->attendanceService->clockOut(
            $request->user(),
            $request->only(['notes'])
        );

        return response()->json([
            'message' => 'Clock out berhasil',
            ...$result,
        ]);
    }

    /**
     * Get today's attendance status
     */
    public function todayStatus(Request $request)
    {
        $status = $this->attendanceService->getTodayStatus($request->user());

        return response()->json($status);
    }

    /**
     * Get monthly attendance statistics
     */
    public function monthlyStats(Request $request)
    {
        $stats = $this->attendanceService->getMonthlyStats(
            $request->user(),
            (int) $request->get('month', now()->month),
            (int) $request->get('year', now()->year)
        );

        return response()->json($stats);
    }

    /**
     * Admin: list attendance with filters and pagination
     */
    public function adminIndex(Request $request)
    {
        $attendances = $this->attendanceService->getAdminAttendances(
            $request->only(['user_id', 'status', 'start_date', 'end_date', 'per_page'])
        );

        return response()->json($attendances);
    }

    /**
     * Admin: export attendance as CSV
     */
    public function export(Request $request): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="attendances.csv"',
        ];

        $callback = function () use ($request) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Tanggal', 'Karyawan', 'Shift', 'Clock In', 'Clock Out', 'Status', 'Catatan']);

            $this->attendanceService->streamExport(
                $request->only(['user_id', 'status', 'start_date', 'end_date']),
                function ($rows) use ($handle) {
                    /** @var \Illuminate\Support\Collection $rows */
                    foreach ($rows as $row) {
                        fputcsv($handle, [
                            $row->date?->format('Y-m-d'),
                            $row->user?->name,
                            $row->shift ? ($row->shift->start_time . ' - ' . $row->shift->end_time) : '-',
                            $row->clock_in?->format('H:i'),
                            $row->clock_out?->format('H:i'),
                            $row->status,
                            $row->notes,
                        ]);
                    }
                }
            );

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
