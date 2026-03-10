<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Wishlist extends Model
{
    use HasFactory;

    protected $table = "wishlists";

    protected $fillable = [
        'user_id',
        'product_id',
        'selected_options',
        'selected_quantity',
        'selected_variant'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, "user_id", "user_id");
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function productImage()
    {
        return $this->belongsTo(ProductImage::class, 'product_id', "product_id");
    }

    public function productVariant()
    {
        return $this->hasMany(ProductVariant::class, "product_id", "product_id");
    }
}
