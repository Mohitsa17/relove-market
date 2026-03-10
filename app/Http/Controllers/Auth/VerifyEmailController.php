<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(Request $request, $id, $hash): RedirectResponse
    {
        \Log::info('=== VERIFICATION START ===', [
            'id' => $id,
            'hash' => $hash,
            'full_url' => $request->fullUrl(),
            'has_session' => $request->hasSession(),
            'is_authenticated' => Auth::check(),
        ]);

        $user = User::find($id);

        if (!$user) {
            \Log::error('User not found', ['id' => $id]);
            return redirect()->route('homepage')
                ->with('errorMessage', 'User not found.');
        }

        \Log::info('User found', [
            'user_id' => $user->user_id,
            'email' => $user->email,
            'current_email_verified_at' => $user->email_verified_at,
            'hasVerifiedEmail' => $user->hasVerifiedEmail(),
        ]);

        // Verify hash matches
        $expectedHash = sha1($user->getEmailForVerification());
        \Log::info('Hash comparison', [
            'expected' => $expectedHash,
            'received' => $hash,
            'email_for_hash' => $user->getEmailForVerification(),
            'match' => hash_equals((string) $hash, $expectedHash),
        ]);

        if (!hash_equals((string) $hash, $expectedHash)) {
            \Log::error('Hash mismatch!');
            return redirect()->route('homepage')
                ->with('errorMessage', 'Invalid verification link.');
        }

        if ($user->hasVerifiedEmail()) {
            \Log::info('Email already verified');

            // Log the user in since they're verified
            Auth::login($user);
            $request->session()->regenerate();

            return redirect()->route('homepage')
                ->with('successMessage', 'Your email is already verified! You are now logged in.');
        }

        // Mark email as verified
        $result = $user->markEmailAsVerified();

        \Log::info('markEmailAsVerified result', [
            'success' => $result,
            'user_saved' => $user->wasChanged(),
            'new_email_verified_at' => $user->email_verified_at,
        ]);

        if ($result) {
            event(new Verified($user));
            \Log::info('Verified event fired');

            // Update user status to Active if it's not already
            if ($user->status !== 'Active') {
                $user->status = 'Active';
                $user->save();
                \Log::info('User status updated to Active');
            }
        } else {
            \Log::error('Failed to mark email as verified!');
            return redirect()->route('homepage')
                ->with('errorMessage', 'Failed to verify email. Please try again.');
        }

        // Log the user in after verification
        Auth::login($user);
        $request->session()->regenerate();

        // Store basic user info in session
        session([
            'user_id' => $user->user_id,
            'user_email' => $user->email,
            'user_name' => $user->name,
            'email_verified' => true,
        ]);

        \Log::info('User logged in after verification', [
            'user_logged_in' => Auth::check(),
            'session_id' => session()->getId(),
            'final_email_verified_at' => $user->email_verified_at,
        ]);

        return redirect()->route('homepage');
    }
}