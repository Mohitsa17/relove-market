<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $table = "products";

    protected $primaryKey = "product_id";

    public $incrementing = false;

    protected $keyType = "string";

    protected $fillable = [
        'product_id',
        "product_name",
        'product_description',
        'product_price',
        'product_quantity',
        'product_status',
        'product_condition',
        'product_brand',
        'product_material',
        'product_manufacturer',
        'product_weight',
        'featured',
        'total_ratings',
        'seller_id',
        'category_id',
        'blocked_at',
        'block_reason'
    ];

    public function seller()
    {
        return $this->belongsTo(Seller::class, "seller_id", "seller_id");
    }

    public function category()
    {
        return $this->HasOne(Category::class, "category_id", "category_id");
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, "product_id", "product_id");
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function productFeature()
    {
        return $this->hasMany(ProductFeature::class, "product_id", 'product_id');
    }

    public function productIncludeItem()
    {
        return $this->hasMany(ProductIncludeItem::class, 'product_id', 'product_id');
    }

    public function productImage()
    {
        return $this->hasMany(ProductImage::class, 'product_id', 'product_id');
    }

    public function productVideo()
    {
        return $this->hasMany(ProductVideo::class, 'product_id', 'product_id');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class, "product_id", "product_id");
    }

    public function productEmbeddings()
    {
        return $this->hasMany(ProductEmbeddings::class, "product_id", "product_id");
    }

    public function productVariant()
    {
        return $this->hasMany(ProductVariant::class, "product_id", "product_id");
    }
}
