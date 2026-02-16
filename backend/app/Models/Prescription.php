<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $table = 'prescription';
    protected $primaryKey = 'prescription_id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'prescription_image',
        'status',
        'uploaded_at'
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
        'status' => 'integer'
    ];

    //accessor to get full image URL
    public function getImageUrlAttribute()
    {
        if ($this->prescription_image) {
            return asset('storage/' . $this->prescription_image);
        }
        return null;
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function order()
    {
        return $this->hasOne(Order::class, 'prescription_id');
    }
}
