const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_PASS, // App password (not your Gmail password)
  },
});

const sendVoterKeyEmail = async (to, key) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Your Voting Key',
    text: `Welcome! Your voting key is: ${key}`,
  };
  await transporter.sendMail(mailOptions);
};

const sendPasswordResetCodeEmail = async (adminEmail, userEmail, code) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: adminEmail,
    subject: 'Password Reset Verification Code',
    text: `A password reset was requested for user: ${userEmail}\nVerification code: ${code}`,
  };
  await transporter.sendMail(mailOptions);
};

const sendSignupVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Verify your email address',
    text: `Welcome! Please verify your email address using this code: ${code}`,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendVoterKeyEmail, sendPasswordResetCodeEmail, sendSignupVerificationEmail }; 