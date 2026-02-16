<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $table = 'complaint';
    protected $primaryKey = 'complaint_id';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'email',
        'category',
        'description',
        'status',
        'image_url',
        'attachment_count',
        'submitted_at'
    ];
}
