const nodemailer = require("nodemailer");

let transporter;

// Create Ethereal test account on startup
nodemailer.createTestAccount().then(testAccount => {
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("Ethereal test account created:", testAccount.user);
});

exports.sendInviteEmail = async ({ to, teamName, token }) => {
  const acceptUrl = `http://localhost:3000/accept-invite?token=${token}`;
  const rejectUrl = `http://localhost:3000/reject-invite?token=${token}`;

  const info = await transporter.sendMail({
    from: `"Trello Clone" <no-reply@trello-clone.com>`,
    to,
    subject: `You’ve been invited to join ${teamName}`,
    html: `
      <h2>Invitation to join <b>${teamName}</b></h2>
      <p>You’ve been invited. Click below to respond:</p>
      <p>
        <a href="${acceptUrl}" style="color:green;">✅ Accept</a> | 
        <a href="${rejectUrl}" style="color:red;">❌ Reject</a>
      </p>
    `,
  });

  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
};
