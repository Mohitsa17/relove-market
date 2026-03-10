<?php

use App\Models\Business;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('business', function (Blueprint $table) {
            $table->string("business_id")->primary();
            $table->string("business_type");
            $table->string("business_description");
            $table->timestamps();
        });

        Business::insert([
            [
                "business_id" => "BUS001",
                "business_type" => "Casual Seller",
                "business_description" => "Selling items occasionally from my personal collection or unused possessions.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS002",
                "business_type" => "Home Declutter",
                "business_description" => "Clearing out home items, furniture, and things I no longer need.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS003",
                "business_type" => "Fashion & Clothing",
                "business_description" => "Selling preloved clothes, shoes, accessories, and fashion items.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS004",
                "business_type" => "Electronics & Gadgets",
                "business_description" => "Selling used phones, laptops, tablets, and other electronic devices.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS005",
                "business_type" => "Books & Media",
                "business_description" => "Selling second-hand books, movies, music, and educational materials.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS006",
                "business_type" => "Hobby & Collectibles",
                "business_description" => "Selling items from my hobbies, collections, or special interests.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS007",
                "business_type" => "Sports & Fitness",
                "business_description" => "Selling sports equipment, fitness gear, and outdoor items.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS008",
                "business_type" => "Kids & Baby Items",
                "business_description" => "Selling children's clothes, toys, and baby equipment.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS009",
                "business_type" => "Home & Kitchen",
                "business_description" => "Selling kitchenware, home appliances, and household items.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS010",
                "business_type" => "Creative Crafts",
                "business_description" => "Selling handmade, upcycled, or DIY crafted items.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS011",
                "business_type" => "Beauty & Personal Care",
                "business_description" => "Selling skincare, cosmetics, and personal care items.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS012",
                "business_type" => "Gaming & Entertainment",
                "business_description" => "Selling video games, consoles, and entertainment equipment.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS013",
                "business_type" => "Small Business Owner",
                "business_description" => "Running a small business selling various products regularly.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS014",
                "business_type" => "Student Seller",
                "business_description" => "A student selling items to earn extra income or clear dorm items.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS015",
                "business_type" => "Gardening & Outdoor",
                "business_description" => "Selling gardening tools, plants, and outdoor living items.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS016",
                "business_type" => "Pet Supplies",
                "business_description" => "Selling pet accessories, food, and pet-related items.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS017",
                "business_type" => "Tools & DIY",
                "business_description" => "Selling tools, hardware, and DIY equipment.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS018",
                "business_type" => "Local Artisan",
                "business_description" => "Creating and selling handmade or locally made products.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS019",
                "business_type" => "Seasonal Seller",
                "business_description" => "Selling seasonal items like holiday decorations or seasonal gear.",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "business_id" => "BUS020",
                "business_type" => "Just Getting Started",
                "business_description" => "New to selling online and exploring what to offer.",
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
        Schema::dropIfExists('business');
    }
};
