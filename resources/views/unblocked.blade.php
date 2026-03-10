<x-mail::layout>
    <x-slot:header>
        <x-mail::header :url="config('app.url')">
            {{ config('app.name') }}
        </x-mail::header>
    </x-slot:header>

    <x-mail::message>
        # Product Unblocked Notification

        Dear {{ $product->seller->seller_name }},

        Good news! Your product **"{{ $productName }}"** (ID: {{ $productId }}) has been unblocked and is now
        available for sale.

        **Unblocked on:** {{ $unblockedAt }}
        **Action by:** {{ $adminName }}

        ## What this means:
        - Your product is now visible to customers
        - Customers can purchase this product
        - The product is back in search results

        You can now manage your product as usual through your seller dashboard.

        Thank you for your patience and cooperation.
    </x-mail::message>

    <x-slot:footer>
        <x-mail::footer>
            © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
        </x-mail::footer>
    </x-slot:footer>
</x-mail::layout>
