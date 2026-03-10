<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductIncludeItem extends Model
{
    protected $primaryKey = "item_id";

    public $incrementing = false;

    public $keyType = "string";

    protected $table = "product_include_item";

    protected $fillable = [
        "item_id",
        "product_id",
        "item_name",
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, "product_id", "product_id");
    }
}
