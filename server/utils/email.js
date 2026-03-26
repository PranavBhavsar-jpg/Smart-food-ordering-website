const nodemailer = require("nodemailer");

async function sendRegistrationEmail(user) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: user.email,
    subject: "Welcome to TCET Canteen!",
    html: `<h1>Welcome, ${user.name}!</h1><p>You have successfully registered for the TCET Canteen app.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendRegistrationEmail };
