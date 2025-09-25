<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Shift;
use App\Models\Attendance;
use Carbon\Carbon;

class AttendanceRecentSeeder extends Seeder
{
    public function run(): void
    {
        $employees = User::where('role', 'employee')->take(10)->get();
        $endDate = Carbon::today();
        $startDate = $endDate->copy()->subDays(4); // 5 hari terakhir termasuk hari ini

        foreach ($employees as $employee) {
            $current = $startDate->copy();
            while ($current->lte($endDate)) {
                if ($current->isWeekday()) {
                    // Pastikan ada shift
                    $shift = Shift::firstOrCreate([
                        'user_id' => $employee->id,
                        'date' => $current->format('Y-m-d'),
                    ], [
                        'start_time' => '08:00',
                        'end_time' => '17:00',
                        'status' => 'assigned',
                    ]);

                    // Tentukan status acak: hadir, izin, sakit, telat, alfa
                    $rand = rand(1, 100);
                    if ($rand <= 70) {
                        // hadir/telat
                        $isLate = rand(0, 1) === 1;
                        $status = $isLate ? 'telat' : 'hadir';
                        $clockInMinute = $isLate ? rand(5, 25) : rand(0, 5);
                        $clockOutMinute = rand(0, 30);
                        Attendance::updateOrCreate([
                            'user_id' => $employee->id,
                            'date' => $current->format('Y-m-d'),
                        ], [
                            'shift_id' => $shift->id,
                            'status' => $status,
                            'clock_in' => Carbon::createFromFormat('H:i', '08:' . sprintf('%02d', $clockInMinute))->format('H:i'),
                            'clock_out' => Carbon::createFromFormat('H:i', '17:' . sprintf('%02d', $clockOutMinute))->format('H:i'),
                        ]);
                    } elseif ($rand <= 85) {
                        // izin
                        Attendance::updateOrCreate([
                            'user_id' => $employee->id,
                            'date' => $current->format('Y-m-d'),
                        ], [
                            'shift_id' => $shift->id,
                            'status' => 'izin',
                            'notes' => 'Izin keperluan pribadi',
                        ]);
                    } elseif ($rand <= 95) {
                        // sakit
                        Attendance::updateOrCreate([
                            'user_id' => $employee->id,
                            'date' => $current->format('Y-m-d'),
                        ], [
                            'shift_id' => $shift->id,
                            'status' => 'sakit',
                            'notes' => 'Sakit',
                        ]);
                    } else {
                        // alfa
                        Attendance::updateOrCreate([
                            'user_id' => $employee->id,
                            'date' => $current->format('Y-m-d'),
                        ], [
                            'shift_id' => $shift->id,
                            'status' => 'alfa',
                        ]);
                    }
                }
                $current->addDay();
            }
        }
    }
}
