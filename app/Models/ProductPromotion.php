<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductPromotion extends Model
{
    protected $fillable = [
        "promotion_id",
        "product_id"
    ];
}
