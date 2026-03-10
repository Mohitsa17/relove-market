<?php

namespace App\Http\Controllers\BuyerPage;

use App\Http\Controllers\Controller;

use App\Events\BuyerPage\SellerRegistration\SellerRegistered;

use App\Models\SellerRegistration;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SellerRegistrationController extends Controller
{
    // Function for validate and process the users who want to become a seller in relove market.
    public function sellerRegistrationProcess(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // Step 1: Account Info
            'name' => ['required', 'regex:/^[a-zA-Z\s]+$/u'],
            'email' => ['required', 'email'],
            'phoneNumber' => ['required', 'regex:/^[0-9]{9,15}$/'],

            // Step 2: Store Info
            'storeName' => ['required', 'string'],
            'verificationType' => ['required', 'string', 'in:nric,passport,business_registration,driving_license'],
            'verificationImage' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'], // 5MB max
            'storeDescription' => ['required', 'string'],
            'storeAddress' => ['required', 'string'],
            'storeCity' => ['required', 'string'],
            'storeState' => ['required', 'string'],
            'businessType' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        // ✅ Generate next registration ID
        $lastSeller = SellerRegistration::orderByRaw("CAST(SUBSTRING(registration_id FROM 7) AS INTEGER) DESC")->first();
        $lastId = $lastSeller ? (int) Str::after($lastSeller->registration_id, 'SELLER') : 0;
        $nextId = $lastId + 1;
        $registrationId = 'SELLER' . str_pad($nextId, 5, '0', STR_PAD_LEFT);

        // ✅ Store verification image
        $verificationImagePath = null;
        if ($request->hasFile('verificationImage')) {
            $file = $request->file('verificationImage');
            $filename = 'verification_' . $registrationId . '.' . $file->getClientOriginalExtension();

            $verificationImagePath = $file->storeAs(
                "verification_documents/{$registrationId}",
                $filename,
                'public'
            );
        }

        $SellerRegistered = SellerRegistration::create([
            'registration_id' => $registrationId,
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phoneNumber,
            'store_name' => $request->storeName,
            'store_description' => $request->storeDescription,
            'store_address' => $request->storeAddress,
            'store_city' => $request->storeCity,
            'store_state' => $request->storeState,
            'business_id' => $request->businessType,
            'verification_type' => $request->verificationType,
            'verification_image' => $verificationImagePath, // Store image path
            'status' => "Pending",
        ]);

        // Fire the event to make the request update in real time on admin dashboard.
        broadcast(new SellerRegistered($SellerRegistered, "Registered"));

        return redirect(route("homepage"))
            ->with("successMessage", "Registration successful! Please wait for approval.");
    }
}