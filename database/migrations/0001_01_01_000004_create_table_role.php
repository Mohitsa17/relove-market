<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use App\Models\Role;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->string("role_id")->primary();
            $table->string("role_name");
            $table->timestamps();
        });

        Role::insert([
            [
                'role_id' => 'ReLo-B0001',
                'role_name' => 'Buyer',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => 'ReLo-S0001',
                'role_name' => 'Seller',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => 'ReLo-A0001',
                'role_name' => 'Admin',
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
        Schema::dropIfExists('roles');
    }
};
