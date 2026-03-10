<?php

namespace App\Mail;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ProductUnblockedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $product;
    public $adminName;

    public function __construct(Product $product)
    {
        $this->product = $product;
        $this->adminName = auth()->user()->name ?? 'Administrator';
    }

    public function build()
    {
        return $this->subject('Product Unblocked - ' . config('app.name'))
            ->markdown('emails.products.unblocked')
            ->with([
                'productName' => $this->product->product_name,
                'adminName' => $this->adminName,
                'productId' => $this->product->product_id,
                'unblockedAt' => now()->format('F j, Y \a\t g:i A'),
            ]);
    }
}