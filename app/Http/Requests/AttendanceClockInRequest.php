<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceClockInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'employee';
    }

    public function rules(): array
    {
        return [
            // Optional to keep backward compatibility with existing UI, but preferred to send
            'shift_id' => ['sometimes', 'integer', 'exists:shifts,id'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
