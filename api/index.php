<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap, and create the application...
$app = require_once __DIR__.'/../bootstrap/app.php';

// Set up /tmp directory for Vercel Serverless environment
$storagePath = '/tmp/storage';
if (!is_dir($storagePath)) {
    $directories = [
        $storagePath . '/app/public',
        $storagePath . '/framework/cache/data',
        $storagePath . '/framework/sessions',
        $storagePath . '/framework/testing',
        $storagePath . '/framework/views',
        $storagePath . '/logs',
    ];

    foreach ($directories as $directory) {
        if (!is_dir($directory)) {
            mkdir($directory, 0777, true);
        }
    }
}

// Tell Laravel to use /tmp/storage
$app->useStoragePath($storagePath);

// Handle the request
$app->handleRequest(Request::capture());
