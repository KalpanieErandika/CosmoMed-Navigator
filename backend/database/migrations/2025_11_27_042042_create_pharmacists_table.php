<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
Schema::create('pharmacists', function (Blueprint $table) {
    $table->id('pharmacist_id');

    $table->unsignedBigInteger('user_id');
    $table->unsignedBigInteger('pharmacy_id')->nullable();


    $table->string('contact_no', 10);
    $table->string('license_path');
    $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
    $table->string('approved_by')->nullable();
    $table->string('pharmacy_name');
    $table->text('address');

    $table->timestamps();

    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('pharmacy_id')->references('id')->on('pharmacies')->onDelete('cascade');
});

    }

    public function down(): void
    {
        Schema::dropIfExists('pharmacists');
    }
};
