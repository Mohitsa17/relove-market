<?php

namespace App\Mail;

use App\Models\SellerRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SellerRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $sellerRegistered, $reason;

    /**
     * Create a new message instance.
     */
    public function __construct(SellerRegistration $sellerRegistered, $reason)
    {
        $this->sellerRegistered = $sellerRegistered;
        $this->reason = $reason;
    }

    public function build()
    {
        return $this->subject('Your Seller Request Has Been Rejected')
            ->view('emails.seller_rejected');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Seller Rejected Mail',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'seller_rejected',
            with: [
                'data' => $this->sellerRegistered,
                'reason' => $this->reason,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
