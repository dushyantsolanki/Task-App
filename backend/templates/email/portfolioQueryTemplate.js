export default function (to, name, message) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5; color: #333333;">
  <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background-color: rgba(44, 55, 202, 0.777); color: #ffffff; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">New Contact Message</h1>
      <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">You have received a new message from your website</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px 24px;">
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5;">Hello,</p>
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5;">Someone has submitted a message through your contact form:</p>
      
      <!-- Name Field -->
      <div style="margin-bottom: 20px;">
        <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">From</div>
        <div style="padding: 12px 16px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 16px;">${name}</div>
      </div>
      
      <!-- Message Field -->
      <div style="margin-bottom: 32px;">
        <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Message</div>
        <div style="padding: 16px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
      </div>
      
      <!-- Call to Action -->
      <div style="text-align: center;">
        <a href="mailto:${to}?subject=Re:response" 
           style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Reply to Message
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="padding: 20px 24px; border-top: 1px solid #e5e7eb; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
      <p style="margin: 0; font-size: 12px; color: #6b7280;">
        This message was sent from your portfolio contact form
      </p>
    </div>
    
  </div>
</body>
</html>`;
}
