<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $table = "product_variants";

    protected $primaryKey = 'variant_id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        "variant_id",
        "product_id",
        "variant_combination",
        "variant_key",
        "quantity",
        "price",
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, "product_id", "product_id");
    }
}
