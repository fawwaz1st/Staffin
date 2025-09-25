<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Resources\ShiftResource;
use App\Models\Shift;
use App\Services\ShiftService;
use Illuminate\Http\Response;

class ShiftController extends Controller
{
    public function __construct(private readonly ShiftService $shiftService)
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $shifts = $this->shiftService->paginate(
            $request->only(['date', 'start_date', 'end_date', 'status', 'user_id', 'q', 'per_page'])
        );

        return ShiftResource::collection($shifts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'user_id' => 'nullable|exists:users,id',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $shift = $this->shiftService->create($request->user(), $request->only([
            'date', 'start_time', 'end_time', 'user_id', 'location', 'notes',
        ]));

        return (new ShiftResource($shift))
            ->additional(['message' => 'Shift berhasil dibuat'])
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Shift $shift)
    {
        $shift->load('user');
        return new ShiftResource($shift);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Shift $shift)
    {
        $request->validate([
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'user_id' => 'nullable|exists:users,id',
            'status' => 'required|in:open,assigned,completed',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $updated = $this->shiftService->update($request->user(), $shift, $request->only([
            'date', 'start_time', 'end_time', 'user_id', 'status', 'location', 'notes',
        ]));

        return (new ShiftResource($updated))
            ->additional(['message' => 'Shift berhasil diperbarui'])
            ->response();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Shift $shift)
    {
        $this->shiftService->delete(request()->user(), $shift);

        return response()->json([
            'message' => 'Shift berhasil dihapus',
        ]);
    }

    /**
     * Get available employees for shift assignment
     */
    public function getAvailableEmployees(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $employees = $this->shiftService->availableEmployees($request->date);

        return response()->json(['data' => $employees]);
    }

    /**
     * List shifts for the authenticated employee
     */
    public function myShifts(Request $request)
    {
        $shifts = $this->shiftService->paginateForUser(
            $request->user(),
            $request->only(['date', 'start_date', 'end_date', 'status', 'per_page'])
        );

        return ShiftResource::collection($shifts);
    }
}
