<x-mail::layout>
    <x-slot:header>
        <x-mail::header :url="config('app.url')">
            {{ config('app.name') }}
        </x-mail::header>
    </x-slot:header>

    <x-mail::message>
        # Product Blocked Notification

        Dear {{ $product->seller->seller_name }},

        Your product **"{{ $productName }}"** (ID: {{ $productId }}) has been blocked by our administration team.

        @if ($reason)
            **Reason for blocking:**
            {{ $reason }}
        @else
            **Reason for blocking:**
            Violation of platform policies
        @endif

        **Blocked on:** {{ $blockedAt }}
        **Action by:** {{ $adminName }}

        ## What this means:
        - Your product is no longer visible to customers
        - Customers cannot purchase this product
        - The product has been removed from search results

        If you believe this action was taken in error, please contact our support team for assistance.

        Thank you for your understanding.
    </x-mail::message>

    <x-slot:footer>
        <x-mail::footer>
            © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
        </x-mail::footer>
    </x-slot:footer>
</x-mail::layout>
