const nodemailer = require("nodemailer");

const sendMail = async (to, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hmsadmin06@gmail.com",
        pass: "ddkspxdckprquead", // no spaces
      },
    });

    const mailOptions = {
      from: "hmsadmin06@gmail.com",
      to,
      subject,
      text,
    };

    if (html) {
      mailOptions.html = html;
    }

    await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully");
    return { sent: true };
  } catch (error) {
    console.error("Mail error:", error);
    return { sent: false, error: error.message };
  }
};

module.exports = sendMail;
