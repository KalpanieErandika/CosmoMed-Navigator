<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    use HasFactory;

    protected $table = 'medicines_1';
    protected $primaryKey = 'medicine_id';

    //disable auto increment
    public $incrementing = true;

    protected $fillable = [
        'medicine_id',
        'Genaric Name',
        'Brand Name',
        'Dosage',
        'Pack Type',
        'Pack Size',
        'Manufacturer',
        'Country code',
        'Local Agent',
        'Dossier No',
        'Schedule',
        'Registration No',
        'Date of Registration',
        'Validity Period'
    ];

    //accessor for generic name
    public function getGenericNameAttribute()
    {
        return $this->attributes['Genaric Name'];
    }

    //accessor for brand name
    public function getBrandNameAttribute()
    {
        return $this->attributes['Brand Name'];
    }

    //mutator for generic name
    public function setGenericNameAttribute($value)
    {
        $this->attributes['Genaric Name'] = $value;
    }

    //mutator for brand name
    public function setBrandNameAttribute($value)
    {
        $this->attributes['Brand Name'] = $value;
    }

    //get medicine names for ocr
    public function scopeForOcr($query)
    {
        return $query->select('Brand Name as name', 'Genaric Name as generic_name')
                     ->whereNotNull('Brand Name')
                     ->orWhereNotNull('Genaric Name')
                     ->distinct();
    }
}
