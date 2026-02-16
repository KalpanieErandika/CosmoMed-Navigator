<!DOCTYPE html>
<html>
<head>
    <title>Account Approval Revoked</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background-color: #f8f9fa; }
        .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Account Approval Revoked</h1>
        </div>

        <div class="content">
            <p>Dear {{ $pharmacist->pharmacist_name }},</p>

            <div class="alert">
                <strong>Important Notice:</strong> Your NMRA pharmacist account approval has been revoked.
            </div>

            <p>We regret to inform you that your NMRA pharmacist account approval has been revoked effective immediately.</p>

            <p><strong>Details:</strong></p>
            <ul>
                <li><strong>Name:</strong> {{ $pharmacist->pharmacist_name }}</li>
                <li><strong>SLMC Registration:</strong> {{ $pharmacist->slmc_reg_no }}</li>
                <li><strong>Email:</strong> {{ $pharmacist->email }}</li>
                <li><strong>Revocation Reason:</strong> {{ $reason }}</li>
                <li><strong>Revocation Date:</strong> {{ now()->format('F d, Y') }}</li>
            </ul>

            <p><strong>What this means:</strong></p>
            <ul>
                <li>You will no longer have access to the NMRA pharmacist portal</li>
                <li>You cannot perform pharmacist-related activities in the system</li>
                <li>Your account status has been changed to "Revoked"</li>
            </ul>

            <p>If you believe this revocation is in error, or if you have questions about this decision,
            please contact NMRA.</p>

            <p>Thank you for your understanding.</p>
        </div>

        <div class="footer">
            <p>National Medicines Regulatory Authority (NMRA)</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
