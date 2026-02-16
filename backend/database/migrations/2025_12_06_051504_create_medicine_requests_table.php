<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medicine_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_id')->unique();
            $table->unsignedBigInteger('rare_medicine_id');
            $table->string('medicine_name');
            $table->unsignedBigInteger('user_id');
            $table->string('user_name');
            $table->string('user_email')->nullable();
            $table->string('user_phone');
            $table->unsignedBigInteger('pharmacist_id');
            $table->unsignedBigInteger('pharmacy_id')->nullable();
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->text('special_instructions')->nullable();
            $table->string('prescription_path')->nullable();
            $table->boolean('urgent')->default(false);
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed', 'cancelled'])->default('pending');
            $table->text('pharmacist_notes')->nullable();
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('rare_medicine_id')->references('rare_id')->on('rare_medicine')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('pharmacist_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('pharmacy_id')->references('id')->on('pharmacies')->onDelete('set null');

            // Indexes
            $table->index(['user_id', 'status']);
            $table->index(['pharmacist_id', 'status']);
            $table->index('request_id');
            $table->index('rare_medicine_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicine_requests');
    }
};
