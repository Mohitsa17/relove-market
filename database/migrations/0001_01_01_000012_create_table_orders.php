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
        Schema::create('orders', function (Blueprint $table) {
            $table->string("order_id")->primary();
            $table->string('payment_intent_id')->unique();
            $table->double("amount");
            $table->string("currency")->default("myr");
            $table->string('user_id');
            $table->string('seller_id');
            $table->string("payment_method");
            $table->string("payment_status");
            $table->string("order_status");
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
