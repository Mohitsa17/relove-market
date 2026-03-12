<?php

namespace App\Events\BuyerPage\SellerRegistration;

use App\Models\SellerRegistration;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SellerRegistered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public SellerRegistration $sellerRegistration;
    public string $action;

    /**
     * Create a new event instance.
     */
    public function __construct(SellerRegistration $sellerRegistration, string $action)
    {
        $this->sellerRegistration = $sellerRegistration;
        $this->action = $action;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('seller-registrations'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'seller.registered';
    }

    /**
     * Data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'registration_id' => $this->sellerRegistration->registration_id,
            'name'            => $this->sellerRegistration->name,
            'store_name'      => $this->sellerRegistration->store_name,
            'status'          => $this->sellerRegistration->status,
            'action'          => $this->action,
        ];
    }
}
