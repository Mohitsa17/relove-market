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
        Schema::create('seller_earnings', function (Blueprint $table) {
            $table->id();
            $table->string('seller_id');
            $table->string('order_id');
            $table->decimal('amount', 10, 2);
            $table->double("commission_rate")->default(0.08);
            $table->decimal('commission_deducted', 10, 2);
            $table->double("payout_amount")->default(0);
            $table->string('status')->default('pending');
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->foreign('order_id')->references('order_id')->on('orders');
            $table->foreign('seller_id')->references('seller_id')->on('sellers');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_earnings');
    }
};
