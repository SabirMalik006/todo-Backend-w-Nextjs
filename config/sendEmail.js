
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",   auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: `"Task Manager" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
