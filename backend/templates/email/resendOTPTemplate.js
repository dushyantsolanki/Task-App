export default function (surname, OTP, expiredIn) {
  return `
     <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification </title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 10px !important; }
      .otp-box { font-size: 20px !important; padding: 15px !important; }
      .button { font-size: 16px !important; padding: 10px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f6f8fa; color: #222222;">

  <table role="presentation" width="100%" style="max-width: 600px; margin: 20px auto; padding: 0; background-color: #ffffff; border-radius: 0.75rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    <tr>
      <td align="center" style="padding: 30px 20px 20px;">
        <h1 style="font-size: 28px; font-weight: 700; color: #ff9900; margin: 15px 0 10px;">Task Mate</h1>
        <p style="font-size: 16px; color: #555555; margin: 0;">Your productivity, simplified.</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px;">
        <h2 style="font-size: 22px; font-weight: 600; color: #222222; margin: 0 0 15px;">Resend OTP</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #555555; margin: 0 0 20px;">
         ${surname} Need another OTP? Here's a new One-Time Password for your Task Mate account.
        </p>
        <div style="text-align: center; margin: 25px 0;">
          <span class="otp-box" style="display: inline-block; font-size: 24px; font-weight: bold; color: #ff9900; letter-spacing: 8px; background-color: #f0f0f0; padding: 15px 25px; border-radius: 0.5rem; border: 1px solid rgba(255, 153, 0, 0.2); transition: transform 0.2s ease-in-out;">
            ${OTP}
          </span>
        </div>
        <p style="font-size: 14px; line-height: 1.5; color: #555555; margin: 0 0 20px;">
          This OTP is valid for ${expiredIn} minutes. Please do not share it with anyone.
        </p>
   
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; font-size: 14px; color: #555555; background-color: #f6f8fa; border-radius: 0 0 0.75rem 0.75rem;">
        <p style="margin: 0;">&copy; 2025 Task Mate. All rights reserved.</p>
        <p style="margin: 10px 0 0; font-size: 12px;">Need help? Reach out to our support team at dushyantsolanki.dev@gmail.com</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
