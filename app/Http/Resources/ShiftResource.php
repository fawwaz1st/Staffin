<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class ShiftResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        $formatTime = function ($time) {
            if (!$time) return null;
            try { return Carbon::parse($time)->format('H:i'); } catch (\Throwable $e) { return (string) $time; }
        };

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'date' => $this->date ? Carbon::parse($this->date)->format('Y-m-d') : null,
            'start_time' => $formatTime($this->start_time),
            'end_time' => $formatTime($this->end_time),
            'status' => $this->status,
            'location' => $this->location,
            'notes' => $this->notes,
            'user' => $this->whenLoaded('user', function () {
                return $this->user ? [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ] : null;
            }),
            'created_at' => optional($this->created_at)->toISOString(),
            'updated_at' => optional($this->updated_at)->toISOString(),
        ];
    }
}
