<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductEmbeddings extends Model
{
    protected $table = "product_embeddings";

    protected $fillable = [
        "product_id",
        "name",
        "embedding",
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, "product_id", "product_id");
    }
}
