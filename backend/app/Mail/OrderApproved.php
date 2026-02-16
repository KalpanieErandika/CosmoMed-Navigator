<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderApproved extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $customer;
    public $pharmacist;
    public $pharmacy;
    public $orderLink;

    public function __construct($order, $customer, $pharmacist, $pharmacy = null)
    {
        $this->order = $order;
        $this->customer = $customer;
        $this->pharmacist = $pharmacist;
        $this->pharmacy = $pharmacy;
        $this->orderLink = url("/orders/{$order->order_id}");
    }

    public function build()
    {
        // Set default values
        $pharmacistName = $this->pharmacist->pharmacist_name ?? 'Pharmacist';
        $pharmacistPhone = $this->pharmacist->contact_no ?? '077-XXX-XXXX';
        $pharmacistEmail = $this->pharmacist->email ?? 'pharmacist@pharmacare.lk';

        // Get pharmacy name
        if ($this->pharmacy) {
            $pharmacyName = $this->pharmacy->name ?? $this->pharmacy->pharmacy_name ?? 'PharmaCare Pharmacy';
        } else {
            $pharmacyName = 'CosmoMed Pharmacy';
        }

        $totalAmount = ($this->order->quantity * ($this->order->unit_price ?? 0));

        return $this->subject('Order ' . $this->order->order_id . ' Approved')
                    ->markdown('approved')
                    ->with([
                        'order' => $this->order,
                        'customerName' => $this->customer->name ?? $this->customer->email,
                        'pharmacistName' => $pharmacistName,
                        'pharmacistPhone' => $pharmacistPhone,
                        'pharmacistEmail' => $pharmacistEmail,
                        'pharmacyName' => $pharmacyName,
                        'orderLink' => $this->orderLink,
                        'totalAmount' => $totalAmount,
                    ]);
    }
}
