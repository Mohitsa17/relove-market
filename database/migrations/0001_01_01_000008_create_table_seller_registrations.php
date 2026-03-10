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
        Schema::create('seller_registrations', function (Blueprint $table) {
            $table->string("registration_id")->primary();
            $table->string("name");
            $table->string("email");
            $table->string("phone_number");
            $table->string("store_name");
            $table->string("store_description");
            $table->string("store_address");
            $table->string("store_city");
            $table->string("store_state");
            $table->string('business_id');
            $table->string('verification_type');
            $table->string('verification_image');
            $table->string("status");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_registrations');
    }
};
