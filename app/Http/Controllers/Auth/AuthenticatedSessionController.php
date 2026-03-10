<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        \Log::info('LOGIN ATTEMPT START', [
            'session_id' => session()->getId(),
            'csrf_token' => csrf_token(),
            'auth_check' => Auth::check(),
            'is_inertia' => $request->header('X-Inertia'),
        ]);

        // Check if already logged in
        if (Auth::check()) {
            $user = Auth::user();
            \Log::info('User already logged in', ['user_id' => $user->user_id]);
            return $this->handleRedirect($user, $request);
        }

        $request->authenticate();

        $user = Auth::user();

        \Log::info('LOGIN SUCCESS - BEFORE REGENERATION', [
            'user_id' => $user->user_id,
            'old_session_id' => session()->getId(),
            'old_csrf_token' => substr(csrf_token(), 0, 10) . '...',
        ]);

        // ✅ Block users if status is not active
        if ($user->status !== 'Active') {
            Auth::logout();
            return back()->with('errorMessage', 'Your account has been blocked. Please contact support.');
        }

        // ✅ BLOCK ALL LOGINS if email is not verified
        if (!$user->hasVerifiedEmail()) {
            Auth::logout();
            return back()->with("errorMessage", "You must verify your email address before logging in.");
        }

        // 📝 Update last login timestamp
        $user->update(['last_login_at' => now()]);

        $request->session()->regenerate();

        $newCsrfToken = csrf_token();

        \Log::info('SESSION REGENERATED', [
            'user_id' => $user->user_id,
            'new_session_id' => session()->getId(),
            'new_csrf_token' => substr($newCsrfToken, 0, 10) . '...',
        ]);

        // Store user info in session (for cart, etc.)
        session([
            'user_id' => $user->user_id,
            'user_email' => $user->email,
            'user_name' => $user->name,
            'last_login' => now()->timestamp,
        ]);

        if ($user->role->role_name === 'Seller') {
            session(['seller_id' => $user->seller_id]);
        }

        \Log::info('USER SESSION DATA SET', [
            'user_id' => session('user_id'),
            'seller_id' => session('seller_id'),
            'session_data_keys' => array_keys(session()->all()),
        ]);

        // Handle redirect with proper CSRF token handling
        return $this->handleRedirect($user, $request, $newCsrfToken);
    }

    /**
     * Handle redirect based on request type (Inertia or traditional)
     */
    private function handleRedirect($user, Request $request, $newCsrfToken = null)
    {
        $user->load('role');
        $redirectUrl = $this->getRedirectUrl($user);

        \Log::info('HANDLING REDIRECT', [
            'redirect_url' => $redirectUrl,
            'user_role' => $user->role->role_name,
            'is_inertia' => $request->header('X-Inertia'),
            'has_new_csrf_token' => !empty($newCsrfToken),
        ]);

        // For Inertia requests, return a JSON response with the new CSRF token
        if ($request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'redirect' => $redirectUrl,
                'csrf_token' => $newCsrfToken ?: csrf_token(),
                'user' => [
                    'id' => $user->user_id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->role_name,
                ],
                'message' => 'Login successful',
            ], 200, [
                'X-Inertia' => 'true',
            ]);
        }

        // Traditional redirect
        return redirect($redirectUrl);
    }

    /**
     * Get redirect URL based on user role
     */
    private function getRedirectUrl($user)
    {
        $user->load('role');
        $role_name = $user->role->role_name;

        switch ($role_name) {
            case 'Seller':
                return route('seller-dashboard');
            case 'Admin':
                return route('admin-dashboard');
            default:
                return route('homepage');
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        \Log::info('LOGOUT START', [
            'user_id' => Auth::id(),
            'session_id' => session()->getId(),
            'csrf_token_before' => substr(csrf_token(), 0, 10) . '...',
            'is_inertia' => $request->header('X-Inertia'),
        ]);

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $newCsrfToken = csrf_token();

        \Log::info('LOGOUT COMPLETE', [
            'new_csrf_token' => substr($newCsrfToken, 0, 10) . '...',
            'new_session_id' => session()->getId(),
        ]);

        // For Inertia requests - use Inertia::location for redirect
        if ($request->header('X-Inertia')) {
            // Update the CSRF token in the session for the next request
            session()->put('logout_csrf_token', $newCsrfToken);

            // Redirect using Inertia::location
            return Inertia::location(route('homepage'));
        }

        // Traditional redirect
        return redirect(route('homepage'));
    }
}