<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeMail;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            Mail::to($request->email)->send(new WelcomeMail([
                'name' => $request->name,
                'email' => $request->email,
            ]));
            return redirect()->intended(route('homepage', absolute: false));
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('successMessage', 'verification-link-sent');
    }
}
