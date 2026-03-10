<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;

use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    protected $user_id;

    protected $seller_id;

    public function __construct()
    {
        $this->user_id = session('user_id');
        $this->seller_id = session('seller_id');
    }

    public function getMessages($conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);

        $user = Auth::user(); // from users table

        // Check if the user is buyer or seller in this conversation
        $isBuyer = $conversation->buyer_id === $user->user_id;
        $isSeller = $user->seller_id && $conversation->seller_id === $user->seller_id;

        if (!$isBuyer && !$isSeller) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = Message::with('sender', 'user', "seller")
            ->where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'conversation_id' => $message->conversation_id,
                    'user' => $message->user,
                    'seller' => $message->seller,
                    'sender_id' => $message->sender_id,
                    'sender_type' => $message->sender_type,
                    'message' => $message->message,
                    'read' => $message->read,
                    'created_at' => $message->created_at->toISOString(),
                ];
            });

        return response()->json($messages);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'conversation_id' => 'required|exists:conversations,id',
            'tempId' => 'nullable' // Add tempId for optimistic updates
        ]);

        $conversation = Conversation::findOrFail($request->conversation_id);

        $user = Auth::user();

        // Check if the user is buyer or seller in this conversation
        $isBuyer = $conversation->buyer_id === $user->user_id;
        $isSeller = $conversation->seller_id === $user->seller_id;
        $senderId = $isBuyer ? $user->user_id : $user->seller_id;

        if (!$isBuyer && !$isSeller) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message = Message::create([
            'conversation_id' => $request->conversation_id,
            'sender_id' => $senderId,
            'sender_type' => $isBuyer ? 'buyer' : 'seller',
            'message' => $request->message,
        ]);

        // Load the sender relationship
        $message->load('sender');

        // Update conversation last message
        $conversation->update([
            'last_message' => $request->message,
            'last_message_at' => now(),
        ]);

        // Update unread count
        if ($isBuyer) {
            $conversation->increment('unread_count_seller');
        } else {
            $conversation->increment('unread_count_buyer');
        }

        // Refresh the conversation to get updated counts
        $conversation->refresh();

        // Broadcast event WITHOUT toOthers() to ensure all clients receive it
        broadcast(new MessageSent($message));

        return response()->json([
            'success' => true,
            'message' => $message,
            'tempId' => $request->tempId // Return the tempId for client matching
        ]);
    }

    public function markAsRead($conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);

        if (Auth::id() === $conversation->buyer_id) {
            $conversation->update(['unread_count_buyer' => 0]);
        } else {
            $conversation->update(['unread_count_seller' => 0]);
        }

        // Mark messages as read
        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', Auth::id())
            ->update(['read' => true]);

        return response()->json(['success' => true]);
    }

    public function startConversation(Request $request)
    {
        $request->validate([
            'seller_id' => 'required|exists:sellers,seller_id',
            'product_id' => 'required|exists:products,product_id',
            'message' => 'required|string|max:1000',
        ]);

        $user = Auth::user();

        // Find or create conversation
        $conversation = Conversation::firstOrCreate([
            'buyer_id' => $user->user_id,
            'seller_id' => $request->seller_id,
            'product_id' => $request->product_id,
        ], [
            'last_message' => $request->message,
            'last_message_at' => now(),
            'unread_count_seller' => 1,
        ]);

        // Create first message
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->user_id,
            'sender_type' => 'buyer',
            'message' => $request->message,
            'read' => false,
        ]);

        broadcast(new MessageSent($message));

        return response()->json([
            'success' => true,
            'conversation_id' => $conversation->id,
            'message' => 'Conversation started successfully'
        ]);
    }

    public function getConversations(Request $request)
    {
        $user = Auth::user();

        $conversations = Conversation::with(['seller', 'buyer', 'product'])
            ->where(function ($query) use ($user) {
                // Match conversations where the user is the buyer
                $query->where('buyer_id', $user->user_id);

                // Or conversations where the user is the seller (if seller_id exists)
                if ($user->seller_id) {
                    $query->orWhere('seller_id', $user->seller_id);
                }
            })
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($conversation) use ($user) {
                return [
                    'id' => $conversation->id,
                    'user' => $conversation->buyer,
                    'seller' => $conversation->seller,
                    'seller_name' => $conversation->seller->name ?? 'Unknown Seller',
                    'buyer_name' => $conversation->buyer->name ?? 'Unknown Buyer',
                    'product' => $conversation->product->product_name ?? 'Unknown Product',
                    'product_id' => $conversation->product_id,
                    'last_message' => $conversation->last_message,
                    'timestamp' => $conversation->last_message_at
                        ? $conversation->last_message_at->diffForHumans()
                        : 'No messages',
                    'unread_count' => $user->user_id === $conversation->buyer_id
                        ? $conversation->unread_count_buyer
                        : $conversation->unread_count_seller,
                ];
            });

        return response()->json($conversations);
    }

    public function sellerChat()
    {
        $seller_storeInfo = Seller::with("sellerStore")
            ->where("seller_id", $this->seller_id)
            ->get();

        return Inertia::render("SellerPage/SellerChatPage", ["seller_storeInfo" => $seller_storeInfo]);
    }
}