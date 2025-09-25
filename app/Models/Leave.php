<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Leave extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'start_date',
        'end_date',
        'reason',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    /**
     * Leave belongs to user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate total days
     */
    public function getTotalDaysAttribute()
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }
}
