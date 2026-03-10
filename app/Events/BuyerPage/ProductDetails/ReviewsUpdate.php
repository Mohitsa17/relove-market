<?php

namespace App\Events\BuyerPage\ProductDetails;

use App\Models\Rating;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReviewsUpdate implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $review;

    public function __construct(Rating $review)
    {
        $this->review = $review;
    }


    public function broadcastOn()
    {
        return new Channel('product.' . $this->review->product_id);
    }

    public function broadcastAs()
    {
        return 'ReviewsUpdate';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->review->id,
            'product_id' => $this->review->product_id,
            'rating' => $this->review->rating,
            'comment' => $this->review->comment,
            'user_id' => $this->review->user_id,
            'profile_image' => $this->review->user->profile_image,
            'created_at' => $this->review->created_at->toDateTimeString(),
        ];
    }
}
