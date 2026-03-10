<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

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
        '/tmp/bootstrap/cache',
    ];

    foreach ($directories as $directory) {
        if (!is_dir($directory)) {
            mkdir($directory, 0777, true);
        }
    }
}

// Set cache paths for Laravel to use /tmp since /var/task is read-only
$_SERVER['APP_PACKAGES_CACHE'] = '/tmp/bootstrap/cache/packages.php';
$_SERVER['APP_SERVICES_CACHE'] = '/tmp/bootstrap/cache/services.php';
$_SERVER['APP_ROUTES_CACHE']   = '/tmp/bootstrap/cache/routes-v7.php';
$_SERVER['APP_CONFIG_CACHE']   = '/tmp/bootstrap/cache/config.php';
$_SERVER['APP_EVENTS_CACHE']   = '/tmp/bootstrap/cache/events.php';

$_ENV['APP_PACKAGES_CACHE'] = '/tmp/bootstrap/cache/packages.php';
$_ENV['APP_SERVICES_CACHE'] = '/tmp/bootstrap/cache/services.php';
$_ENV['APP_ROUTES_CACHE']   = '/tmp/bootstrap/cache/routes-v7.php';
$_ENV['APP_CONFIG_CACHE']   = '/tmp/bootstrap/cache/config.php';
$_ENV['APP_EVENTS_CACHE']   = '/tmp/bootstrap/cache/events.php';

putenv('APP_PACKAGES_CACHE=/tmp/bootstrap/cache/packages.php');
putenv('APP_SERVICES_CACHE=/tmp/bootstrap/cache/services.php');
putenv('APP_ROUTES_CACHE=/tmp/bootstrap/cache/routes-v7.php');
putenv('APP_CONFIG_CACHE=/tmp/bootstrap/cache/config.php');
putenv('APP_EVENTS_CACHE=/tmp/bootstrap/cache/events.php');

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap, and create the application...
$app = require_once __DIR__.'/../bootstrap/app.php';

// Tell Laravel to use /tmp/storage
$app->useStoragePath($storagePath);

// Handle the request
$app->handleRequest(Request::capture());
