<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public $tempId;

    public function __construct($message, $tempId = null)
    {
        $this->message = $message;
        $this->tempId = $tempId;
    }

    public function broadcastOn()
    {
        $channels = [];

        // Channel for the specific conversation
        $channels[] = new Channel("conversation.{$this->message->conversation_id}.buyer");
        $channels[] = new Channel("conversation.{$this->message->conversation_id}.seller");

        // User-wide notification channels
        $channels[] = new PrivateChannel("user.{$this->message->conversation->buyer_id}.buyer");
        $channels[] = new PrivateChannel("user.{$this->message->conversation->seller_id}.seller");

        return $channels;
    }
    public function broadcastAs()
    {
        return 'MessageSent';
    }

    public function broadcastWith()
    {
        return ['message' => $this->message->load('sender')];

        // Only include tempId if it exists
        if ($this->tempId) {
            $data['message']['tempId'] = (string) $this->tempId;
        }

        return $data;
    }
}