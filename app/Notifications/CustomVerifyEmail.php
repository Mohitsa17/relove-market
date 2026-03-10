<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class CustomVerifyEmail extends BaseVerifyEmail
{
    public function toMail($notifiable)
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verify Your Relove Market Account')
            ->greeting('Hey there, Relover! 💚')
            ->line('Thanks for joining **Relove Market** — your trusted place to buy, sell, or rent preloved items sustainably.')
            ->line('Click the button below to verify your email and start exploring the marketplace!')
            ->action('Verify Email Address', $verificationUrl)  // <-- ensures $actionUrl and $actionText exist
            ->line('If you didn’t create an account, you can safely ignore this email.');
    }
}
