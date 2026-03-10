<?php

namespace App\Mail;

use App\Models\SellerRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SellerApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $sellerRegistered;

    /**
     * Create a new message instance.
     */
    public function __construct(SellerRegistration $sellerRegistered)
    {
        $this->sellerRegistered = $sellerRegistered;

    }

    public function build()
    {
        return $this->subject('Your Seller Request Has Been Approved')
            ->view('emails.seller_approved');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Seller Approved Mail',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'seller_approved',
            with: [
                'data' => $this->sellerRegistered,
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
