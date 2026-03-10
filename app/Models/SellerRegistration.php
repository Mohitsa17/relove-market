<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SellerRegistration extends Model
{
    protected $primaryKey = 'registration_id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = "seller_registrations";

    protected $fillable = [
        "registration_id",
        "name",
        "email",
        "phone_number",
        "store_name",
        "store_description",
        "store_address",
        "store_city",
        "store_state",
        "business_id",
        "verification_type",
        "verification_image",
        "status",
    ];

    public function business()
    {
        return $this->hasOne(Business::class, 'business_id', 'business_id');
    }
}
