import {config} from 'dotenv';
import nodemailer from 'nodemailer';
import {capitalizeFirstLetter} from '../utils/helpers.js';
config();

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const resetPasswordEmailSender = async (user, isForgotPasswordEmail) => {
  try {
    if (isForgotPasswordEmail) {
      const mailOptions = {
        to: user.email,
        from: `Connectly <noreply.${process.env.GMAIL_EMAIL}>`,
        subject: 'Connectly - Password Reset Request',

        html: `<p>Hello ${capitalizeFirstLetter(user.username)},</p>
       <p>We received a request to reset the password for your <strong>Connectly</strong> account.</p>
       <p>Please use the following code to complete the process:</p>
       <h2>${user.verifyToken}</h2>
       <p>If you did not request this, please ignore this email.</p>
       <p>Best regards,<br>The Connectly Team</p>`,
      };
      const info = await transporter.sendMail(mailOptions);
      console.log(' Forgot password email sent', info.response);
    } else {
      const mailOptions = {
        to: user.email,
        from: `Connectly <noreply.${process.env.GMAIL_EMAIL}>`,
        subject: 'Password Successfully Changed!',
        html: `
       <p>Hello ${capitalizeFirstLetter(user.username)},</p>
       <p>We want to inform you that your password has been successfully changed.</p>
      <p>If you did not initiate this change, please contact our support team immediately.</p>
      <p>Best regards,<br>The Connectly Team</p>
      `,
      };
      const info = await transporter.sendMail(mailOptions);
      console.log('Changed passoword email sent', info.response);
    }
  } catch (err) {
    console.log('Error sending email', err);
  }
};

export const emailSuccessSignupSender = async user => {
  try {
    const mailOptions = {
      to: user.email,
      from: `Connectly <noreply.${process.env.GMAIL_EMAIL}>`,
      subject: 'Welcome to Connectly!',

      html: `<p>Hello ${capitalizeFirstLetter(user.username)},</p>
     <p>Welcome to <strong>Connectly</strong>!</p>
     <p>We're excited to have you on board. This email confirms that your account has been successfully created.</p>
     <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
     <p>Best regards,<br>The Connectly Team</p>`,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('email sent', info.response);
  } catch (err) {
    console.log('Error sending email', err);
  }
};

export const emailTokenVerifierSender = async user => {
  try {
    const mailOptions = {
      to: user.email,
      from: `Connectly <noreply.${process.env.GMAIL_EMAIL}>`,
      subject: 'Connectly Account Verification',
      //   text: `Hello ${user.username},

      // Thank you for registering with Connectly!

      // Please use the following code to verify your email address:

      // Verification Code: ${user.verifyToken}

      // If you did not initiate this request, please ignore this email.

      // Best regards,
      // The Connectly Team`,

      html: `<p>Hello ${capitalizeFirstLetter(user.username)},</p>
    <p>Please use the following code to verify your email address:</p>
    <h2>${user.verifyToken}</h2>
    <p>If you did not initiate this request, please ignore this email.</p>
    <p>Best regards,<br>The Connectly Team</p>`,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('email sent', info.response);
  } catch (err) {
    console.log('Error sending email', err);
  }
};
