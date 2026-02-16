<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order Rejected</title>
</head>
<body>
    <h2>Hello {{ $customerName }},</h2>

    <p>Your order <strong>#{{ $order->order_id }}</strong> has been rejected.</p>

    <p><strong>Order:</strong> {{ $order->medicine_name }}</p>
    <p><strong>Quantity:</strong> {{ $order->quantity }}</p>
    <p><strong>Reviewed by:</strong> {{ $pharmacistName }}</p>

    <p><strong>Reason:</strong></p>
    <p style="background: #fef2f2; padding: 10px; border-left: 4px solid #dc2626;">
        {{ $reason }}
    </p>

    <p>Please contact the pharmacy to discuss this.</p>

    <p>We apologize for any inconvenience.</p>

    <br>
    <p>Best regards,</p>
    <p>{{ $pharmacyName }}</p>
</body>
</html>
