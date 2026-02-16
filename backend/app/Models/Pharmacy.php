<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pharmacy extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_no',
        'pharmacy_name',
        'address',
        'pharmacist_name',
        'slmc_reg_no',
        'moh',
        'district'
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'pharmacy_id');
    }

    public function pharmacists()
    {
        return $this->hasMany(Pharmacist::class, 'pharmacy_id');
    }

    public function primaryPharmacist() //return the first user of type pharmacist for a pharmacy
    {
        return $this->users()->where('user_type', 'pharmacist')->first();
    }
}
