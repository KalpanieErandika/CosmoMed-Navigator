<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('approved_by')->nullable()->after('pharmacist_status'); // NMRA official ID
            $table->timestamp('approved_at')->nullable()->after('approved_by'); // approval/rejection timestamp
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['approved_by', 'approved_at']);
        });
    }
};
