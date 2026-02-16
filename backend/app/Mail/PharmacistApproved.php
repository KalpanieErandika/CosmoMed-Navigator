<?php
namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PharmacistApproved extends Mailable
{
    use Queueable, SerializesModels;

    public $pharmacist;

    public function __construct(User $pharmacist)
    {
        $this->pharmacist = $pharmacist;
    }

    public function build()
{
    return $this->subject('NMRA Pharmacist Account Approved')
               ->view('pharmacist_approved')
                ->with([
                    'pharmacistName' => $this->pharmacist->pharmacist_name,
                    'email' => $this->pharmacist->email,
                ]);
}

}
