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
        Schema::create('sellers', function (Blueprint $table) {
            $table->string("seller_id")->primary();
            $table->string("seller_name");
            $table->string("seller_email")->unique();
            $table->string("seller_phone");
            $table->string('store_id');
            $table->string('business_id');
            $table->boolean("is_verified")->default(True);
            $table->timestamps();

            $table->foreign("store_id")->references('store_id')->on('seller_stores')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sellers');
    }
};
