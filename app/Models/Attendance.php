<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'shift_id',
        'date',
        'status',
        'clock_in',
        'clock_out',
        'working_hours',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'clock_in' => 'datetime:H:i',
        'clock_out' => 'datetime:H:i',
        'working_hours' => 'decimal:2',
    ];

    /**
     * Attendance belongs to user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Attendance belongs to shift
     */
    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function calculateWorkingHours()
    {
        if ($this->clock_in && $this->clock_out) {
            $clockIn = Carbon::parse($this->clock_in);
            $clockOut = Carbon::parse($this->clock_out);
            $hours = $clockIn->diffInHours($clockOut, true);
            $this->working_hours = round($hours, 2);
            $this->save();
            return $this->working_hours;
        }
        return 0;
    }

    public function canClockOut()
    {
        return $this->clock_in && !$this->clock_out;
    }
}
