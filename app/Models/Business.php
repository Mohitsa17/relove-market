<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Business extends Model
{
    protected $table = "business";

    protected $primary_key = "business_id";

    protected $keyType = "string";

    protected $fillable = [
        "business_id",
        "business_type",
        "business_description",
    ];

    public function seller()
    {
        return $this->belongsTo(Seller::class, "business_id", "business_id");
    }
}
