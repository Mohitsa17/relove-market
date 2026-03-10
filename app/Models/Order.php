<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    public $primaryKey = "order_id";

    public $incrementing = false;

    protected $keyType = "string";

    protected $table = "orders";

    protected $fillable = [
        'order_id',
        'payment_intent_id',
        'amount',
        'currency',
        'payment_method',
        'payment_status',
        'order_status',
        'user_id',
        'seller_id',
        'notes',
    ];

    public static function generateOrderId()
    {
        return 'ORD-' . date('Ymd') . '-' . strtoupper(uniqid());
    }

    public function user()
    {
        return $this->belongsTo(User::class, "user_id", "user_id");
    }

    public function seller()
    {
        return $this->belongsTo(Seller::class, "seller_id", "seller_id");
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, "order_id", "order_id");
    }

    public function sellerEarning()
    {
        return $this->hasMany(SellerEarning::class, "order_id", "order_id");
    }
}
