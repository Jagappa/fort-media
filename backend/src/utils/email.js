const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

exports.sendPartnerCredentials = async (email, name, password) => {
  if (!process.env.SMTP_USER) {
    console.log('⚠ SMTP not configured. Partner credentials:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    return;
  }
  const transporter = createTransporter();
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/login`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Fort Media — Your Partner Account',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#0A0A0A;color:#fff;padding:40px;border:1px solid #222;">
        <h1 style="color:#DC2626;margin:0 0 24px;">FORT MEDIA</h1>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your Fort Media partner account has been created. Use the credentials below to log in:</p>
        <div style="background:#161616;padding:20px;margin:20px 0;border:1px solid #333;">
          <p style="margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
          <p style="margin:0;"><strong>Password:</strong> ${password}</p>
        </div>
        <a href="${loginUrl}" style="display:inline-block;padding:14px 32px;background:#DC2626;color:#fff;text-decoration:none;font-weight:bold;margin:16px 0;">LOGIN NOW</a>
        <p style="color:#999;font-size:13px;margin-top:24px;">Please change your password after first login.</p>
        <hr style="border-color:#222;margin:24px 0;" />
        <p style="color:#666;font-size:12px;">© Fort Media — All Rights Reserved.</p>
      </div>
    `,
  });
};

exports.sendPasswordReset = async (email, name, resetUrl) => {
  if (!process.env.SMTP_USER) {
    console.log('⚠ SMTP not configured. Reset URL:');
    console.log(`  ${resetUrl}`);
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Fort Media — Password Reset',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#0A0A0A;color:#fff;padding:40px;border:1px solid #222;">
        <h1 style="color:#DC2626;margin:0 0 24px;">FORT MEDIA</h1>
        <p>Hello <strong>${name}</strong>,</p>
        <p>You requested a password reset. Click the button below to create a new password:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#DC2626;color:#fff;text-decoration:none;font-weight:bold;margin:20px 0;">RESET PASSWORD</a>
        <p style="color:#999;font-size:13px;">This link expires in 30 minutes.</p>
        <p style="color:#999;font-size:13px;">If you didn't request this, ignore this email.</p>
        <hr style="border-color:#222;margin:24px 0;" />
        <p style="color:#666;font-size:12px;">© Fort Media — All Rights Reserved.</p>
      </div>
    `,
  });
};
