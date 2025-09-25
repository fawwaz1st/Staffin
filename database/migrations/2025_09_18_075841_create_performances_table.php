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
        Schema::create('performances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('month', 7); // YYYY-MM format
            $table->decimal('attendance_score', 5, 2)->default(0);
            $table->decimal('task_score', 5, 2)->default(0);
            $table->decimal('behavior_score', 5, 2)->default(0);
            $table->decimal('total_score', 5, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'month']);
            $table->index('month');
            $table->unique(['user_id', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performances');
    }
};
