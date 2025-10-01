
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const msg = {
      to,
      from: {
        email: process.env.EMAIL_FROM, 
        name: "Todo Team",
      },
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log("✅ Email sent successfully to:", to);
  } catch (error) {
    console.error("❌ SendGrid Error:", error.response?.body || error.message);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;
