const nodemailer = require("nodemailer");

const sendMail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ramasuryag@apicalsoftsolution.com",
        pass: "ytzytwbwijkunoeb", // no spaces
      },
    });

    const mailOptions = {
      from: "ramasuryag@apicalsoftsolution.com",
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