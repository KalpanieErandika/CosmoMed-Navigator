<?php
namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PharmacistRejected extends Mailable
{
    use Queueable, SerializesModels;

    public $pharmacist;
    public $reason;

    public function __construct(User $pharmacist, $reason)
    {
        $this->pharmacist = $pharmacist;
        $this->reason = $reason;
    }

    public function build()
{
    return $this->subject('NMRA Pharmacist Account Application Status')
              ->view('pharmacist_rejected')
                ->with([
                    'pharmacistName' => $this->pharmacist->pharmacist_name,
                    'email' => $this->pharmacist->email,
                    'reason' => $this->reason,
                ]);
}

}
