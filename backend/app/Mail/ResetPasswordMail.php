<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }


    public function build()
    {
        return $this->subject('Password Reset Request')
                    ->view('reset_password')
                    ->with([
                        'token' => $this->token,
                    ]);
    }
}
