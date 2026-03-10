<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SellerEarning extends Model
{
    protected $table = 'seller_earnings';

    protected $fillable = [
        'seller_id',
        'order_id',
        'amount',
        'commission_rate',
        'commission_deducted',
        'payout_amount',
        'status',
        'processed_at',
        'paid_at',
    ];

    public function seller()
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'seller_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }
}
