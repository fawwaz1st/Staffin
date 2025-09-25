<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Attendance;
use App\Models\Leave;
use App\Models\Payroll;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function adminSummary()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        $data = [
            'total_employees' => User::where('role', 'employee')->count(),
            'shifts_today' => 8, // Mock data - will be replaced with real shifts
            'attendance_today' => Attendance::whereDate('date', $today)->count(),
            'payroll_pending' => Payroll::where('status', 'pending')->count(),
            'leaves_pending' => Leave::where('status', 'pending')->count(),
            'weekly_attendance' => $this->getWeeklyAttendance(),
            'monthly_performance' => $this->getMonthlyPerformance(),
            'recent_leaves' => Leave::with('user')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($leave) => [
                    'employee' => $leave->user->name,
                    'type' => $leave->type,
                    'start_date' => $leave->start_date->format('d/m/Y'),
                    'end_date' => $leave->end_date->format('d/m/Y'),
                    'status' => $leave->status,
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

    private function getWeeklyAttendance()
    {
        $weekData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $count = Attendance::whereDate('date', $date)->count();
            $weekData[] = [
                'day' => $date->format('D'),
                'date' => $date->format('d/m'),
                'count' => $count
            ];
        }
        return $weekData;
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
