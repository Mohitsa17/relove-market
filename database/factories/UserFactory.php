<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;
    protected static int $counter;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    public function definition(): array
    {
        // Initialize counter on first run
        if (!isset(self::$counter)) {
            $latestUser = User::orderBy('user_id', 'desc')->first();

            self::$counter = ($latestUser && preg_match('/USR-(\d+)/', $latestUser->user_id, $matches))
                ? (int) $matches[1] + 1
                : 1;
        }

        // Increment for each new user
        $newUserId = 'USR-' . str_pad(self::$counter++, 5, '0', STR_PAD_LEFT);

        return [
            'user_id' => $newUserId,
            'name' => fake()->name(),
            'email' => fake()->unique()->userName() . '@gmail.com',
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role_id' => "ReLo-B0001",
            'status' => 'Active',
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
