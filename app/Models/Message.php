<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'sender_type',
        'message',
        'read'
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, "sender_id", "user_id");
    }

    public function seller()
    {
        return $this->belongsTo(User::class, "sender_id", "seller_id");
    }

    public function sender()
    {
        if ($this->sender_type === 'buyer') {
            return $this->belongsTo(User::class, 'sender_id', 'user_id');
        } else {
            return $this->belongsTo(Seller::class, 'sender_id', 'seller_id');
        }
    }
}