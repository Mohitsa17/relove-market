<x-mail::layout>
    <x-slot:header>
        <x-mail::header :url="config('app.url')">
            {{ config('app.name') }}
        </x-mail::header>
    </x-slot:header>

    <x-mail::message>
        # Product Under Review Notification

        Dear {{ $product->seller->seller_name }},

        Your product **"{{ $productName }}"** (ID: {{ $productId }}) has been flagged for review by our
        administration team.

        @if ($reason)
            **Reason for flagging:**
            {{ $reason }}
        @else
            **Reason for flagging:**
            Under review for policy compliance
        @endif

        **Flagged on:** {{ $flaggedAt }}
        **Action by:** {{ $adminName }}

        ## What this means:
        - Your product is temporarily under review
        - It may have limited visibility during this period
        - Our team will complete the review within 24-48 hours

        Please ensure your product complies with our platform policies. If changes are needed, we will notify you.

        Thank you for your cooperation.
    </x-mail::message>

    <x-slot:footer>
        <x-mail::footer>
            © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
        </x-mail::footer>
    </x-slot:footer>
</x-mail::layout>
