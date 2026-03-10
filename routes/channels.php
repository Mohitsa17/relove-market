<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{userId}.buyer', function ($user, $userId) {
    return (string) $user->user_id === (string) $userId;
});

Broadcast::channel('user.{sellerId}.seller', function ($user, $sellerId) {
    return (string) $user->seller_id === (string) $sellerId;
});

Broadcast::channel('seller.orders.{sellerId}', function ($user, $sellerId) {
    Log::info('🔐 Channel seller orders authorization check', [
        'user_id' => $user->user_id,
        'user_seller_id' => $user->seller_id,
        'requested_seller_id' => $sellerId,
        'user_type' => $user->user_type ?? 'unknown'
    ]);

    // Check if user is a seller and has the correct seller_id
    $isAuthorized = $user->seller_id && (string) $user->seller_id === (string) $sellerId;

    Log::info('🔐 Channel authorization result: ' . ($isAuthorized ? 'APPROVED' : 'DENIED'));

    return $isAuthorized;
});

Broadcast::channel('seller.earnings.{sellerId}', function ($user, $sellerId) {
    Log::info('🔐 Channel seller earnings authorization check', [
        'user_id' => $user->user_id,
        'user_seller_id' => $user->seller_id,
        'requested_seller_id' => $sellerId,
        'user_type' => $user->user_type ?? 'unknown'
    ]);

    // Check if user is a seller and has the correct seller_id
    $isAuthorized = $user->seller_id && (string) $user->seller_id === (string) $sellerId;

    Log::info('🔐 Channel authorization result: ' . ($isAuthorized ? 'APPROVED' : 'DENIED'));

    return $isAuthorized;
});

Broadcast::channel('seller.payment.{sellerId}', function ($user, $sellerId) {
    Log::info('🔐 Channel seller payment authorization check', [
        'user_id' => $user->user_id,
        'user_seller_id' => $user->seller_id,
        'requested_seller_id' => $sellerId,
        'user_type' => $user->user_type ?? 'unknown'
    ]);

    // Check if user is a seller and has the correct seller_id
    $isAuthorized = $user->seller_id && (string) $user->seller_id === (string) $sellerId;

    Log::info('🔐 Channel seller payment authorization result: ' . ($isAuthorized ? 'APPROVED' : 'DENIED'));

    return $isAuthorized;
});

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = \App\Models\Conversation::find($conversationId);

    if (!$conversation) {
        return false;
    }

    return $user->user_id === $conversation->buyer_id ||
        $user->user_id === $conversation->sender_id; // use user_id for both
});