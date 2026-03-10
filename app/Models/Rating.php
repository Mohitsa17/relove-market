<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Rating extends Model
{
    use HasFactory;

    protected $table = "ratings";

    protected $fillable = ['user_id', 'product_id', 'rating', 'comment'];

    public function user()
    {
        return $this->belongsTo(User::class, "user_id", "user_id");
    }

    public function product()
    {
        return $this->belongsTo(Product::class, "product_id", "product_id");
    }
}
