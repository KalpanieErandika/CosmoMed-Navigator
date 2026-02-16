<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Add pharmacy_id column if it doesn't exist
            if (!Schema::hasColumn('users', 'pharmacy_id')) {
                $table->unsignedBigInteger('pharmacy_id')->nullable()->after('nmra_id');
            }

            // Add foreign key constraint
            $table->foreign('pharmacy_id')
                  ->references('id')
                  ->on('pharmacies')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['pharmacy_id']);
            $table->dropColumn('pharmacy_id');
        });
    }
};
