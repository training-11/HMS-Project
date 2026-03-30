const nodemailer = require("nodemailer");

const sendMail = async (to, subject, text) => {
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

    await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully");
  } catch (error) {
    console.error("Mail error:", error);
  }
};

module.exports = sendMail;