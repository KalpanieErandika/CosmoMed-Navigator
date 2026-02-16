<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pharmacist extends Model
{
    use HasFactory;

    protected $primaryKey = 'pharmacist_id';

    protected $fillable = [
        'user_id',
        'pharmacy_id',
        'license',
        'contact_no',
        'status',
        'approved_by',
        'pharmacy_name',
        'address'
    ];

    public function user() //relationship between pharmacist and user model
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function pharmacy() ////relationship between pharmacist and pharmacy model
    {
        return $this->belongsTo(Pharmacy::class, 'pharmacy_id');
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function isRejected()
    {
        return $this->status === 'rejected';
    }
}
