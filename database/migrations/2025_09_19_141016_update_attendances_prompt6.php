<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            if (!Schema::hasColumn('attendances', 'shift_id')) {
                $table->foreignId('shift_id')->nullable()->after('user_id')->constrained('shifts')->nullOnDelete();
            }
        });

        // Rename old status to status_old if exists
        if (Schema::hasColumn('attendances', 'status')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->renameColumn('status', 'status_old');
            });
        }

        // Add new enum status in Indonesian
        Schema::table('attendances', function (Blueprint $table) {
            $table->enum('status', ['hadir', 'telat', 'izin', 'sakit', 'alfa'])->default('hadir')->after('clock_out');
            $table->index('status');
        });

        // Map old statuses to new (present->hadir, assigned? none, leave->izin, late->telat, sick->sakit, absent->alfa)
        if (Schema::hasColumn('attendances', 'status_old')) {
            // Backfill new status based on old values
            DB::statement("UPDATE attendances SET status = 'hadir' WHERE status_old IN ('present') OR (status_old IS NULL AND clock_in IS NOT NULL)");
            DB::statement("UPDATE attendances SET status = 'izin' WHERE status_old IN ('leave','permission')");
            DB::statement("UPDATE attendances SET status = 'telat' WHERE status_old IN ('late')");
            DB::statement("UPDATE attendances SET status = 'sakit' WHERE status_old IN ('sick')");
            DB::statement("UPDATE attendances SET status = 'alfa' WHERE status_old IN ('absent') OR (status_old IS NULL AND clock_in IS NULL)");
        }

        // Backfill shift_id by joining shifts on same user and date
        DB::statement(
            "UPDATE attendances a LEFT JOIN shifts s ON s.user_id = a.user_id AND s.date = a.date SET a.shift_id = s.id WHERE a.shift_id IS NULL"
        );

        // Drop old status column
        if (Schema::hasColumn('attendances', 'status_old')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->dropColumn('status_old');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: not fully reversible without data loss. We only drop new status and shift link.
        if (Schema::hasColumn('attendances', 'status')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->dropIndex(['status']);
                $table->dropColumn('status');
            });
        }

        if (Schema::hasColumn('attendances', 'shift_id')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->dropConstrainedForeignId('shift_id');
            });
        }
    }
};
