<?php

// database/migrations/xxxx_create_prescriptions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('image_path');
            $table->text('extracted_text');
            $table->text('raw_text')->nullable();
            $table->json('medications')->nullable();
            $table->json('matched_medicines')->nullable();
            $table->integer('matched_count')->default(0);
            $table->json('structured_data')->nullable();
            $table->decimal('confidence', 3, 2)->default(0.5);
            $table->enum('prescription_type', ['handwritten', 'typed'])->default('handwritten');
            $table->enum('status', ['pending', 'processing', 'processed', 'error'])->default('pending');
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('confidence');
            $table->index('prescription_type');
        });
    }

    public function down()
    {
        Schema::dropIfExists('prescriptions');
    }
};
