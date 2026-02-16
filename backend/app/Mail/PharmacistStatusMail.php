<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Pharmacist;

class PharmacistStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pharmacist;
    public $reason;

    /**
     * Create a new message instance.
     */
    public function __construct(Pharmacist $pharmacist, $reason = null)
    {
        $this->pharmacist = $pharmacist;
        $this->reason = $reason;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $subject = $this->pharmacist->status === 'approved'
            ? 'Pharmacist Account Approved'
            : 'Pharmacist Account Rejected';

        return $this->subject($subject)
                    ->view('pharmacist_status_mail') // Blade file
                    ->with([
                        'pharmacist' => $this->pharmacist,
                        'reason' => $this->reason,
                    ]);
    }
}
