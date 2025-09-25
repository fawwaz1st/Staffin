<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Shift;
use App\Models\Attendance;
use Carbon\Carbon;

class ShiftAttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employees = User::where('role', 'employee')->get();
        $startDate = Carbon::now()->subMonth();
        $endDate = Carbon::now();

        foreach ($employees as $employee) {
            $current = $startDate->copy();
            
            while ($current->lte($endDate)) {
                // Skip weekends
                if ($current->isWeekday()) {
                    // Create shift
                    Shift::create([
                        'user_id' => $employee->id,
                        'date' => $current->format('Y-m-d'),
                        'start_time' => '08:00',
                        'end_time' => '17:00',
                    ]);

                    // Create attendance (status Indonesia)
                    $rand = rand(1, 100);
                    if ($rand <= 75) {
                        // hadir atau telat
                        $isLate = rand(0,1) === 1;
                        Attendance::updateOrCreate([
                            'user_id' => $employee->id,
                            'date' => $current->format('Y-m-d'),
                        ], [
                            'shift_id' => Shift::where('user_id', $employee->id)->whereDate('date', $current->format('Y-m-d'))->value('id'),
                            'status' => $isLate ? 'telat' : 'hadir',
                            'clock_in' => Carbon::createFromFormat('H:i', '08:' . sprintf('%02d', $isLate ? rand(6,25) : rand(0,5)))->format('H:i'),
                            'clock_out' => Carbon::createFromFormat('H:i', '17:' . sprintf('%02d', rand(0,30)))->format('H:i'),
                        ]);
                    } elseif ($rand <= 85) {
                        // izin
                        Attendance::updateOrCreate([
                            'user_id' => $employee->id,
                            'date' => $current->format('Y-m-d'),
                        ], [
                            'shift_id' => Shift::where('user_id', $employee->id)->whereDate('date', $current->format('Y-m-d'))->value('id'),
                            'status' => 'izin',
                        ]);
                    } elseif ($rand <= 95) {
                        // sakit
                        Attendance::updateOrCreate([
                            'user_id' => $employee->id,
                            'date' => $current->format('Y-m-d'),
                        ], [
                            'shift_id' => Shift::where('user_id', $employee->id)->whereDate('date', $current->format('Y-m-d'))->value('id'),
                            'status' => 'sakit',
                        ]);
                    } else {
                        // alfa
                        Attendance::updateOrCreate([
                            'user_id' => $employee->id,
                            'date' => $current->format('Y-m-d'),
                        ], [
                            'shift_id' => Shift::where('user_id', $employee->id)->whereDate('date', $current->format('Y-m-d'))->value('id'),
                            'status' => 'alfa',
                        ]);
                    }
                }
                
                $current->addDay();
            }
        }
    }
}
