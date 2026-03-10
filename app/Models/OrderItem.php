<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $table = "order_items";

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
        'selected_variant',
    ];

    protected $casts = [
        'selected_variant' => 'array',
        'price' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, "order_id", "order_id");
    }

    public function product()
    {
        return $this->belongsTo(Product::class, "product_id", "product_id");
    }

    public function productImage()
    {
        return $this->belongsTo(ProductImage::class, "product_id", "product_id");
    }
}