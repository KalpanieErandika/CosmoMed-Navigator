<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewOrderNotification extends Mailable
{
    use Queueable, SerializesModels; //accept and store data queueable-allows the email to be sent in the background store the email data temporarily

    public $order;
    public $pharmacist;
    public $customerDetails;

    public function __construct($order, $pharmacist, $customerDetails)
    {
        $this->order = $order; //values passed from the controller
        $this->pharmacist = $pharmacist;
        $this->customerDetails = $customerDetails;
    }

    public function build()
    {
    return $this->subject('New Order Received - ' . ($this->order->order_id ?? 'N/A'))
                    ->view('new-order-notification');
    }
}
