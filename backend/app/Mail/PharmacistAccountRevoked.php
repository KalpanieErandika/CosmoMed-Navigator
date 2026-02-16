<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PharmacistAccountRevoked extends Mailable
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
        return $this->subject('NMRA Account Approval Revoked')
                    ->view('pharmacist-account-revoked')
                    ->with([
                        'pharmacist' => $this->pharmacist,
                        'reason' => $this->reason,
                    ]);
    }
}
