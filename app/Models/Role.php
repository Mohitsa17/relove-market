<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Role extends Model
{
    protected $table = "roles";

    protected $primaryKey = 'role_id';
    
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'role_id',
        'role_name'
    ];

    public function user()
    {
        return $this->hasMany(User::class, 'role_id', 'role_id');
    }
}
