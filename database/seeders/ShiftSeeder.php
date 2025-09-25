<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Shift;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;

class ShiftSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $employees = User::where('role', 'employee')->get();
        
        // Create shifts for the past week and next week
        for ($i = -7; $i <= 7; $i++) {
            $date = Carbon::now()->addDays($i);
            
            // Skip weekends for some variety
            if ($date->isWeekend() && rand(0, 1)) {
                continue;
            }
            
            foreach ($employees as $employee) {
                // Not every employee has a shift every day
                if (rand(0, 2) === 0) {
                    continue;
                }
                
                $startHour = rand(7, 9);
                $endHour = $startHour + rand(7, 9);
                
                $shift = Shift::create([
                    'user_id' => $employee->id,
                    'date' => $date->format('Y-m-d'),
                    'start_time' => sprintf('%02d:00', $startHour),
                    'end_time' => sprintf('%02d:00', min($endHour, 23)),
                    'status' => 'assigned',
                    'location' => ['Office A', 'Office B', 'Remote', 'Store'][rand(0, 3)],
                    'notes' => rand(0, 3) === 0 ? 'Shift khusus untuk project urgent' : null,
                ]);
                
                // Create attendance for past dates
                if ($i < 0) {
                    $clockInTime = Carbon::parse($date->format('Y-m-d') . ' ' . sprintf('%02d:00', $startHour))
                                        ->addMinutes(rand(-10, 30));
                    $clockOutTime = Carbon::parse($date->format('Y-m-d') . ' ' . sprintf('%02d:00', min($endHour, 23)))
                                         ->addMinutes(rand(-30, 15));
                    
                    // Some attendance records
                    if (rand(0, 4) !== 0) { // 80% attendance rate
                        $attendance = Attendance::create([
                            'user_id' => $employee->id,
                            'date' => $shift->date,
                            'status' => 'present',
                            'clock_in' => $clockInTime->format('H:i'),
                            'clock_out' => $clockOutTime->format('H:i'),
                        ]);
                        
                        $attendance->calculateWorkingHours();
                    } else {
                        // Absent or leave
                        Attendance::create([
                            'user_id' => $employee->id,
                            'date' => $shift->date,
                            'status' => ['absent', 'leave'][rand(0, 1)],
                        ]);
                    }
                }
            }
        }
        
        // Create some open shifts (unassigned)
        for ($i = 1; $i <= 5; $i++) {
            $date = Carbon::now()->addDays($i);
            
            Shift::create([
                'user_id' => null,
                'date' => $date->format('Y-m-d'),
                'start_time' => '09:00',
                'end_time' => '17:00',
                'status' => 'open',
                'location' => 'Office A',
                'notes' => 'Shift terbuka - butuh karyawan',
            ]);
        }
    }
}
