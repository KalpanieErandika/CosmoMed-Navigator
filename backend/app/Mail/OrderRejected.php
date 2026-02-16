<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderRejected extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $customer;
    public $pharmacist;
    public $reason;
    public $contactLink;
    public $newOrderLink;

    public function __construct($order, $customer, $pharmacist, $reason)
    {
        $this->order = $order;
        $this->customer = $customer;
        $this->pharmacist = $pharmacist;
        $this->reason = $reason;
        $this->contactLink = url('/contact');
        $this->newOrderLink = url('/medicines');
    }

    public function build()
    {
        return $this->subject('Order ' . $this->order->order_id . ' Requires Attention ')
                    ->view('rejected')
                    ->with([
                        'order' => $this->order,
                        'customerName' => $this->customer->name,
                        'pharmacistName' => $this->pharmacist->pharmacist_name ?? 'Pharmacist',
                        'reason' => $this->reason,
                        'rejectedAt' => now(),

                    ]);
    }
}
