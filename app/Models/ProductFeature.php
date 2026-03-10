<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductFeature extends Model
{
    protected $primaryKey = "feature_id";

    public $incrementing = false;

    protected $keyType = "string";

    protected $fillable = ['feature_id', 'product_id', 'feature_text'];

    public function product()
    {
        return $this->belongsTo(Product::class, "product_id", "product_id");
    }
}
