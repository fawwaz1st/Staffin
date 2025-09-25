<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('shifts', function (Blueprint $table) {
            $table->enum('status', ['open', 'assigned', 'completed'])->default('open')->after('end_time');
            $table->string('location')->nullable()->after('status');
            $table->text('notes')->nullable()->after('location');
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null')->after('id');
        });
        
        Schema::table('attendances', function (Blueprint $table) {
            $table->decimal('working_hours', 4, 2)->nullable()->after('clock_out');
            $table->text('notes')->nullable()->after('working_hours');
            // Hapus index lama pada kolom status sebelum mengubah tipe ENUM
            $table->dropIndex('attendances_status_index');
            $table->dropColumn('status');
            $table->enum('status', ['present', 'absent', 'leave'])->default('present')->after('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Catatan: down() tidak diimplementasikan penuh untuk menjaga integritas data.
        // Jika diperlukan, buat migrasi baru untuk mengembalikan perubahan ini secara aman.
    }
};
