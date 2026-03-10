<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    protected $except = [
        'api/*',
    ];

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'csrf_token' => csrf_token(),
            
            'auth' => [
                'user' => function () use ($request) {
                    $user = $request->user();

                    if ($user) {
                        $user->load('role', 'seller');

                        return [
                            'user_id' => $user->user_id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'phone' => $user->phone,
                            'address' => $user->address,
                            'city' => $user->city,
                            'zip_code' => $user->zip_code,
                            'role_id' => $user->role_id,
                            'role_name' => $user->role->role_name,
                            'profile_image' => $user->profile_image,
                            'seller_id' => $user->seller_id,
                            'seller_store_name' => $user->seller?->sellerStore?->store_name ?? "",
                            'created_at' => $user->created_at,
                            'updated_at' => $user->updated_at,
                            'last_login_at' => $user->last_login_at
                        ];
                    }

                    return null;
                },

                'seller' => function () use ($request) {
                    $user = $request->user();

                    if ($user && $user->seller) {
                        $seller = $user->seller;
                        $seller->load("user", "sellerStore");

                        return [
                            'user_id' => $seller->user->user_id,
                            'seller_id' => $seller->seller_id,
                            'seller_store' => $seller->sellerStore,
                            'name' => $seller->seller_name,
                            'email' => $seller->seller_email,
                            'last_login_at' => $user->last_login_at
                        ];
                    }

                    return null;
                },

            ],

            'flash' => [
                'successMessage' => fn() => $request->session()->get('successMessage'),
                'errorMessage' => fn() => $request->session()->get('errorMessage'),
            ],
        ]);
    }
}