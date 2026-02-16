<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order Approved</title>
</head>
<body>
    <h2>Hello {{ $customerName }},</h2>

    <p>Your order <strong>{{ $order->order_id }}</strong> for <strong>{{ $order->medicine_name }}</strong> has been approved.</p>

    <p><strong>Order Details:</strong></p>
    <p>Order ID: {{ $order->order_id }}</p>
    <p>Medicine: {{ $order->medicine_name }}</p>
    <p>Quantity: {{ $order->quantity }}</p>
    <p>Total Amount: LKR {{ number_format($totalAmount, 2) }}</p>
    <p>Delivery Address: {{ $order->address }}</p>

    <p><strong>Pharmacist Contact:</strong></p>
    <p>{{ $pharmacistName }} ({{ $pharmacyName }})</p>
    <p>Phone: {{ $pharmacistPhone }}</p>
    <p>Email: {{ $pharmacistEmail }}</p>

    <p>The pharmacist will contact you about delivery.</p>

    <br>
    <p>Thank you,<br>{{ $pharmacyName }}</p>
</body>
</html>
