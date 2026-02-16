<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // First, we need to drop any foreign keys that reference users.id
        // Since we don't have any yet, we can proceed

        // Change users.id from bigint to int
        Schema::table('users', function (Blueprint $table) {
            $table->integer('id')->autoIncrement()->change();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->bigIncrements('id')->change();
        });
    }
};
