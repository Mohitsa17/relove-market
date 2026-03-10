<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Filesystem\Filesystem;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {

    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        if (env('APP_ENV') === 'local') {
            curl_setopt_array(curl_init(), [
                CURLOPT_CAINFO => base_path('cacert.pem'),
            ]);
        }

        Inertia::share([
            'auth' => fn() => [
                'user' => Auth::user(),
            ],
        ]);
    }
}
