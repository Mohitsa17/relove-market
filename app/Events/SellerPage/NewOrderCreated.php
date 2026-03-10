<?php

namespace App\Events\SellerPage;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewOrderCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;

    public function __construct(Order $order)
    {
        $this->order = $order->load(['user', 'orderItems.product', 'sellerEarning']);
    }

    public function broadcastOn(): array
    {
        $channel = 'seller.orders.' . $this->order->seller_id;
        \Log::info('📡 Broadcasting to channel: ' . $channel);
        return [
            new PrivateChannel($channel),
        ];
    }

    public function broadcastAs()
    {
        return 'new.order.created';
    }

    public function broadcastWith()
    {
        \Log::info('📦 Preparing broadcast data for order: ' . $this->order->order_id);

        return [
            'order' => $this->order,
            'message' => 'New order received from ' . $this->order->user->name
        ];
    }
}