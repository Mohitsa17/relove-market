<?php

namespace App\Http\Controllers\AdminPage;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function adminDashboard()
    {
        return Inertia::render('AdminPage/AdminDashboard');
    }

    public function pendingSellerTable()
    {
        return Inertia::render('AdminPage/PendingSellerTable');
    }

    public function profilePage()
    {
        return Inertia::render('AdminPage/ProfilePage');
    }

    public function transactionPage()
    {
        return Inertia::render('AdminPage/Transactions');
    }

    public function productModeration()
    {
        return Inertia::render('AdminPage/ProductModeration');
    }

    public function userManagement()
    {
        return Inertia::render('AdminPage/UserManagement');
    }
}
