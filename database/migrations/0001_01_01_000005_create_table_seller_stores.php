<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('seller_stores', function (Blueprint $table) {
            $table->string('store_id')->primary();
            $table->string('store_name');
            $table->string('store_description');
            $table->string('store_address');
            $table->string('store_phone');
            $table->string("store_image");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_stores');
    }
};
