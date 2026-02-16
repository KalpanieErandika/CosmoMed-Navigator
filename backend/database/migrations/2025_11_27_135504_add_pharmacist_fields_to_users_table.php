<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('contact_no')->nullable()->after('slmc_reg_no'); // pharmacist contact
            $table->string('license_image')->nullable()->after('contact_no'); // license image path
            $table->enum('pharmacist_status', ['pending','approved','rejected'])->default('pending')->after('license_image'); // NMRA approval status
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['contact_no', 'license_image', 'pharmacist_status']);
        });
    }
};
