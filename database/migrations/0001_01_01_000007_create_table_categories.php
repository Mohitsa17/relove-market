<?php

use App\Models\Category;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->string('category_id')->primary();
            $table->string('category_name');
            $table->timestamps();
        });

        Category::insert([
            [
                "category_id" => "C001",
                "category_name" => "Clothing & Accessories",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "category_id" => "C002",
                "category_name" => "Electronics & Gadgets",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "category_id" => "C003",
                "category_name" => "Home & Furniture",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "category_id" => "C004",
                "category_name" => "Baby & Kids",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "category_id" => "C005",
                "category_name" => "Books & Stationery",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "category_id" => "C006",
                "category_name" => "Sports & Outdoors",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "category_id" => "C007",
                "category_name" => "Beauty & Self-Care",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "category_id" => "C008",
                "category_name" => "Art & Collectibles",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "category_id" => "C009",
                "category_name" => "Jewelry & Watches",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "category_id" => "C010",
                "category_name" => "Vehicles & Bikes",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "category_id" => "C011",
                "category_name" => "Eco-Friendly Items",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "category_id" => "C012",
                "category_name" => "Others",
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
