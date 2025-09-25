<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Dedup attendances by (user_id, date)
        DB::statement('DELETE a FROM attendances a JOIN attendances b ON a.user_id = b.user_id AND a.date = b.date AND a.id > b.id');
        // Add unique index to prevent duplicates per user per date
        Schema::table('attendances', function (Blueprint $table) {
            $table->unique(['user_id', 'date'], 'attendances_user_date_unique');
        });

        // Dedup shifts by (user_id, date) for assigned shifts only (user_id not null)
        DB::statement('DELETE s1 FROM shifts s1 JOIN shifts s2 ON s1.user_id IS NOT NULL AND s2.user_id IS NOT NULL AND s1.user_id = s2.user_id AND s1.date = s2.date AND s1.id > s2.id');
        // Add unique index to ensure a user only has one shift per date (mengikuti business rule controller)
        Schema::table('shifts', function (Blueprint $table) {
            $table->unique(['user_id', 'date'], 'shifts_user_date_unique');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropUnique('attendances_user_date_unique');
        });
        Schema::table('shifts', function (Blueprint $table) {
            $table->dropUnique('shifts_user_date_unique');
        });
    }
};
