<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SellerStore extends Model
{
    protected $table = "seller_stores";

    protected $primaryKey = "store_id";

    public $incrementing = false;
    
    protected $keyType = 'string';

    protected $fillable = [
        "store_id",
        "store_name",
        "store_description",
        "store_address",
        "store_phone",
        "store_image"
    ];

    public function seller()
    {
        return $this->hasMany(Seller::class, "store_id", "store_id");
    }
}
