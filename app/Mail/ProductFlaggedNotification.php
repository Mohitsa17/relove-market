<?php

namespace App\Mail;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ProductFlaggedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $product;
    public $reason;
    public $adminName;

    public function __construct(Product $product, $reason = null)
    {
        $this->product = $product;
        $this->reason = $reason;
        $this->adminName = auth()->user()->name ?? 'Administrator';
    }

    public function build()
    {
        return $this->subject('Product Under Review - ' . config('app.name'))
            ->markdown('emails.products.flagged')
            ->with([
                'productName' => $this->product->product_name,
                'reason' => $this->reason,
                'adminName' => $this->adminName,
                'productId' => $this->product->product_id,
                'flaggedAt' => now()->format('F j, Y \a\t g:i A'),
            ]);
    }
}