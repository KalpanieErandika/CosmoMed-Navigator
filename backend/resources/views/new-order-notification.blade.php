<h3>New Order Received</h3>

<p>Dear Pharmacist,</p>

<p>A new order has been placed.</p>

<ul>
    <li>Order ID: {{ $order->order_id }}</li>
    <li>Medicine: {{ $order->medicine_name }}</li>
    <li>Quantity: {{ $order->quantity }}</li>
    <li>Customer Name: {{ $customerDetails->name }}</li>
    <li>Customer Email: {{ $customerDetails->email }}</li>
    <li>Contact No: {{ $customerDetails->contact_no }}</li>
</ul>

<p>Please log into the system to review and approve the order.</p>

<p>Thank you.</p>
