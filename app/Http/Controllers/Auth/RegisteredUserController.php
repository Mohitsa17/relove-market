<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;

use Exception;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Auth;

use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        Auth::logout();
        session()->invalidate();
        session()->regenerateToken();

        // Validate first - this will automatically throw ValidationException
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            $latestUser = User::orderBy('user_id', 'desc')->first();

            $number = ($latestUser && preg_match('/USR-(\d+)/', $latestUser->user_id, $matches))
                ? (int) $matches[1] + 1
                : 1;

            $newUserId = 'USR-' . str_pad($number, 5, '0', STR_PAD_LEFT);

            $user = User::create([
                'user_id' => $newUserId,
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role_id' => Role::where('role_name', 'Buyer')->value('role_id'),
                'status' => "Active"
            ]);

            \Log::info('BEFORE sending verification email', [
                'user_id' => $user->user_id,
                'email' => $user->email,
            ]);

            // Method 2: Send manually (to be sure)
            try {
                $user->sendEmailVerificationNotification();
                \Log::info('Manual verification email sent');
            } catch (Exception $e) {
                \Log::error('Failed to send verification email: ' . $e->getMessage());
            }

            return redirect(route("register"))->with('successMessage', true);
        } catch (\Throwable $e) {
            \Log::error('Registration Error: ' . $e->getMessage());
            return redirect(route("register"))->with('errorMessage', false);
        }
    }

    public function resendVerification(Request $request)
    {
        try {
            $request->validate([
                'user_email' => 'required|email|exists:users,email',
            ]);

            $user = User::where('email', $request->user_email)->first();

            if ($user && !$user->hasVerifiedEmail()) {
                event(new Registered($user));
            }

            // Check if it's an Inertia request
            if ($request->header('X-Inertia')) {
                return back()->with('successMessage', 'Verification email resent.');
            }

            return back()->with('successMessage', 'Verification email resent.');
        } catch (Exception $e) {
            return back()->with('errorMessage', $e->getMessage());
        }
    }
}
