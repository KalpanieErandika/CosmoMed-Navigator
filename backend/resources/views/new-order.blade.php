<x-mail::message>
New Order Received

Hello {{ $pharmacistName }},

You have received a new order that requires your review.

## Order Summary
- **Order Number:** {{ $order->order_id }}
- **Medicine:** {{ $medicineName }}
- **Customer:** {{ $customerName }}
- **Quantity:** {{ $order->quantity }}
- **Order Date:** {{ $orderDate->format('F d, Y \a\t h:i A') }}
- **Delivery Address:** {{ $order->delivery_address }}
- **Customer Contact:** {{ $order->customer_contact }}

Action Required
Please review this order and either approve or reject it.

Order Status
**Pending** - Awaiting your review

Quick Actions
- **Approve Order:** Allocate stock and notify customer
- **Reject Order:** Provide reason for rejection
- **Contact Customer:** For clarifications if needed

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<small style="color: #6b7280;">
This is an automated notification. You're receiving this because you're a registered pharmacist.<br>
© {{ date('Y') }} CosmoMed Navigator.
</small>
</x-mail::message>
