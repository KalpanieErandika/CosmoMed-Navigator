<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // BIGINT UNSIGNED
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('user_type')->default('general_user'); // general_user, pharmacist, nmra_official
            $table->string('pharmacist_name')->nullable();
            $table->string('slmc_reg_no')->nullable();
            $table->string('nmra_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
