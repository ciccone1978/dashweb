// Run with node testEmail.js

const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendTestEmail() {
    try {
        const testAccount = await nodemailer.createTestAccount();

        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        const mailOptions = {
            from: '"Your App Name" <no-reply@example.com>',
            to: 'test@example.com',
            subject: 'Test Email',
            text: 'This is a test email from Nodemailer with Ethereal.',
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    } catch (error) {
        console.error('Error sending test email:', error);
    }
}

sendTestEmail();