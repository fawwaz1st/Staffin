<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Performance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'month',
        'attendance_score',
        'task_score',
        'behavior_score',
        'total_score',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'attendance_score' => 'decimal:2',
            'task_score' => 'decimal:2',
            'behavior_score' => 'decimal:2',
            'total_score' => 'decimal:2',
        ];
    }

    /**
     * Performance belongs to user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate total score automatically
     */
    protected static function booted()
    {
        static::saving(function ($performance) {
            $performance->total_score = ($performance->attendance_score + $performance->task_score + $performance->behavior_score) / 3;
        });
    }
}
