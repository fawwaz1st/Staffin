<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'base_salary',
        'overtime_hours',
        'allowance',
        'deduction',
        'final_salary',
        'pay_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'base_salary' => 'decimal:2',
            'overtime_hours' => 'decimal:2',
            'allowance' => 'decimal:2',
            'deduction' => 'decimal:2',
            'final_salary' => 'decimal:2',
            'pay_date' => 'date',
        ];
    }

    /**
     * Payroll belongs to user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate final salary automatically
     */
    protected static function booted()
    {
        static::saving(function ($payroll) {
            $overtimeRate = 50000; // Rate per hour
            $overtimePay = $payroll->overtime_hours * $overtimeRate;
            $payroll->final_salary = $payroll->base_salary + $overtimePay + $payroll->allowance - $payroll->deduction;
        });
    }
}
