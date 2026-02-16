const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
});

// Verify the connection configuration
if (process.env.NODE_ENV !== "production") {
  transporter.verify((error, success) => {
    if (error) {
      console.error(" Email Auth Failed:", error.message);
    } else {
      console.log(" Email Server is ready");
    }
  });
}

//function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Bank Backend"<${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log("Error sending email:", error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Bank Backend!";
  const text = `Hello ${name},\n\nThank you for registering at Bank Backend.
    We're excited to have you on board! \n\nBest regards,\nThe Bank Backend Team`;
  const html = `<p>Hello ${name},</p><p>Thank you for registering at Bank Backend.
    We're excited to have you on board! </p><p>Best regards,\nThe Bank Backend Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendRegistrationEmail };
