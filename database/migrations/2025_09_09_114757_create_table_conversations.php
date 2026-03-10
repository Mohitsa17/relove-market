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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->string('buyer_id');
            $table->string('seller_id');
            $table->string('product_id');
            $table->string('last_message')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->integer('unread_count_buyer')->default(0);
            $table->integer('unread_count_seller')->default(0);
            $table->timestamps();

            $table->unique(['buyer_id', 'seller_id', 'product_id']);

            $table->foreign('buyer_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('seller_id')->references('seller_id')->on('sellers')->onDelete('cascade');
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
