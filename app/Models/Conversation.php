<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $fillable = [
        'buyer_id',
        'seller_id',
        'product_id',
        'last_message',
        'last_message_at',
        'unread_count_buyer',
        'unread_count_seller'
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id', "user_id");
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id', "seller_id");
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, "product_id", "product_id");
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function getUnreadCountAttribute($userId, $userType)
    {
        return $userType === 'buyer' ? $this->unread_count_buyer : $this->unread_count_seller;
    }
}