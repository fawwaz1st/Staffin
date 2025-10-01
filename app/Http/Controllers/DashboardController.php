<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Attendance;
use App\Models\Leave;
use App\Models\Payroll;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function adminSummary()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $totalEmployees = User::where('role', 'employee')->count();

        // Calculate attendance percentage today
        $attendancePresentCount = Attendance::whereDate('date', $today)
            ->whereIn('status', ['hadir', 'telat'])
            ->distinct('user_id')
            ->count('user_id');
        $attendancePercentage = $totalEmployees > 0 ? round(($attendancePresentCount / $totalEmployees) * 100) : 0;

        // Get shifts today count (assigned) dan open shifts sebagai notifikasi
        $assignedShiftsToday = Shift::whereDate('date', $today)
            ->whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');

        $openShiftsToday = Shift::whereDate('date', $today)
            ->whereNull('user_id')
            ->count();

        // Get total payroll this month
        $totalPayroll = Payroll::whereBetween('pay_date', [$thisMonth, Carbon::now()])
            ->where('status', 'paid')
            ->sum('final_salary');

        $pendingPayroll = Payroll::where('status', 'pending')->count();
        $pendingLeaves = Leave::where('status', 'pending')->count();
        $pendingUsers = User::where('role', 'employee')->where('status', 'pending')->count();

        $attendanceBreakdown = $this->getAttendanceBreakdown($today);
        $attendanceAlerts = ($attendanceBreakdown['telat'] ?? 0) + ($attendanceBreakdown['alfa'] ?? 0);

        $data = [
            'total_employees' => $totalEmployees,
            'shifts_today' => $assignedShiftsToday,
            'attendance_percentage' => $attendancePercentage,
            'total_payroll' => $totalPayroll,
            'leaves_pending' => $pendingLeaves,
            'payroll_pending' => $pendingPayroll,
            'pending_users' => $pendingUsers,
            'weekly_attendance' => $this->getWeeklyAttendanceChart(),
            'leave_status' => $this->getLeaveStatusDistribution(),
            'attendance_breakdown' => $attendanceBreakdown,
            'notifications' => [
                'dashboard' => 0,
                'users' => $pendingUsers,
                'shifts' => $openShiftsToday,
                'attendance' => $attendanceAlerts,
                'leaves' => $pendingLeaves,
                'payroll' => $pendingPayroll,
                'settings' => 0,
            ],
            'recent_leaves' => Leave::with('user')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($leave) => [
                    'id' => $leave->id,
                    'employee_name' => $leave->user->name,
                    'department' => $leave->user->department ?? 'N/A',
                    'type' => $leave->type,
                    'start_date' => $leave->start_date?->format('d M Y'),
                    'end_date' => $leave->end_date?->format('d M Y'),
                    'duration_days' => $leave->start_date && $leave->end_date ? $leave->start_date->diffInDays($leave->end_date) + 1 : 0,
                    'status' => $leave->status,
                    'reason' => $leave->reason,
                ])
        ];

        return response()->json($data);
    }

    public function employeeSummary(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();

        $todayAttendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        $latestPayroll = Payroll::where('user_id', $user->id)
            ->latest()
            ->first();

        $data = [
            'shift_today' => [
                'start_time' => '08:00',
                'end_time' => '17:00',
                'break_time' => '12:00-13:00',
                'location' => 'Office A'
            ],
            'attendance_today' => [
                'clock_in' => $todayAttendance?->clock_in?->format('H:i'),
                'clock_out' => $todayAttendance?->clock_out?->format('H:i'),
                'status' => $todayAttendance ? 'present' : 'not_clocked_in',
                'working_hours' => $todayAttendance ? $this->calculateWorkingHours($todayAttendance) : 0
            ],
            'latest_payroll' => [
                'period' => $latestPayroll?->period ?? 'N/A',
                'amount' => $latestPayroll?->total_salary ?? 0,
                'status' => $latestPayroll?->status ?? 'pending'
            ],
            'performance_score' => rand(75, 95), // Mock data
            'leaves_remaining' => 12, // Mock data
            'this_month_attendance' => $this->getEmployeeMonthlyAttendance($user->id)
        ];

        return response()->json($data);
    }

    private function getWeeklyAttendanceChart()
    {
        $weekData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $hadir = Attendance::whereDate('date', $date)
                ->whereIn('status', ['hadir', 'telat'])
                ->count();
            $izin = Attendance::whereDate('date', $date)
                ->whereIn('status', ['izin', 'sakit'])
                ->count();
            $weekData[] = [
                'date' => $date->format('d M'),
                'hadir' => $hadir,
                'izin' => $izin
            ];
        }
        return $weekData;
    }

    private function getLeaveStatusDistribution()
    {
        $start = Carbon::now()->startOfMonth();
        $end = Carbon::now();

        return [
            ['name' => 'Disetujui', 'value' => Leave::where('status', 'approved')->whereBetween('created_at', [$start, $end])->count()],
            ['name' => 'Menunggu', 'value' => Leave::where('status', 'pending')->whereBetween('created_at', [$start, $end])->count()],
            ['name' => 'Ditolak', 'value' => Leave::where('status', 'rejected')->whereBetween('created_at', [$start, $end])->count()],
            ['name' => 'Dibatalkan', 'value' => Leave::where('status', 'cancelled')->whereBetween('created_at', [$start, $end])->count()],
        ];
    }

    private function getAttendanceBreakdown(Carbon $date): array
    {
        $statuses = ['hadir', 'telat', 'izin', 'sakit', 'alfa'];
        $counts = Attendance::whereDate('date', $date)
            ->select('status', DB::raw('COUNT(DISTINCT user_id) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $breakdown = [];
        foreach ($statuses as $status) {
            $breakdown[$status] = (int) ($counts[$status] ?? 0);
        }

        return $breakdown;
    }

    private function getMonthlyPerformance()
    {
        $monthData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthData[] = [
                'month' => $month->format('M'),
                'performance' => rand(70, 95) // Mock data
            ];
        }
        return $monthData;
    }

    private function getEmployeeMonthlyAttendance($userId)
    {
        $thisMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        
        $totalDays = $thisMonth->diffInDays($endOfMonth) + 1;
        $presentDays = Attendance::where('user_id', $userId)
            ->whereBetween('date', [$thisMonth, $endOfMonth])
            ->count();
            
        return [
            'present_days' => $presentDays,
            'total_days' => $totalDays,
            'percentage' => $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 1) : 0
        ];
    }

    private function calculateWorkingHours($attendance)
    {
        if (!$attendance->clock_in || !$attendance->clock_out) {
            return 0;
        }

        $clockIn = Carbon::parse($attendance->clock_in);
        $clockOut = Carbon::parse($attendance->clock_out);
        
        return round($clockIn->diffInHours($clockOut, true), 1);
    }
}
