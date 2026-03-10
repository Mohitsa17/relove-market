<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    public function run(): void
    {
        User::factory()->count(20)->create();

        User::factory()->create([
            'user_id' => "ADMIN-00001",
            'name' => 'Mohitsa',
            'email' => 'mohitrp1729@gmail.com',
            'email_verified_at' => now(),
            'password' => bcrypt('admin12345'), // custom password
            'role_id' => "ReLo-A0001",
            'status' => "Active",
        ]);
    }
}
