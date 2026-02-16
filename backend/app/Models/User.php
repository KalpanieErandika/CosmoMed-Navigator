<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'user_type',
        'pharmacist_name',
        'slmc_reg_no',
        'contact_no',
        'nmra_id',
        'pharmacy_id',
        'license_image',
        'pharmacist_status',
        'approved_by',
        'approved_at'
    ];
    protected $hidden = [
        'password',
        'remember_token',
    ];
    protected $casts = [
        'approved_at' => 'datetime', //convert fields automatically to specific types
        'email_verified_at' => 'datetime',
    ];

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class, 'pharmacy_id');
    }

    public function scopePendingPharmacists($query) //allows reusable query
    {
        return $query->where('user_type', 'pharmacist')
                     ->where('pharmacist_status', 'pending');
    }

    public function scopeApprovedPharmacists($query)
    {
        return $query->where('user_type', 'pharmacist')
                     ->where('pharmacist_status', 'approved');
    }

    public function scopeRejectedPharmacists($query)
    {
        return $query->where('user_type', 'pharmacist')
                     ->where('pharmacist_status', 'rejected');
    }
}
