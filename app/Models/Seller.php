<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seller extends Model
{
    protected $table = "sellers";

    protected $primaryKey = "seller_id";

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        "seller_id",
        "seller_name",
        "seller_email",
        "seller_phone",
        "store_id",
        "business_id",
        "is_verified",
    ];

    public function user()
    {
        return $this->belongsTo(User::class, "seller_id", "seller_id");
    }

    public function sellerStore()
    {
        return $this->belongsTo(SellerStore::class, 'store_id', 'store_id');
    }

    public function product()
    {
        return $this->hasMany(Product::class, 'seller_id', 'seller_id');
    }

    public function order()
    {
        return $this->hasMany(Order::class, "seller_id", "seller_id");
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'seller_id', 'seller_id');
    }
}
