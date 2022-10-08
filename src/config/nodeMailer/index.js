require("dotenv").config();
const nodemailer = require("nodemailer");
const { client } = require("../redis");
const adminEmail = process.env.EMAIL_ADMIN;
const passwordEmail = process.env.EMAIL_PASSWORD;

async function sendEmail(email, code, key) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: adminEmail,
        pass: passwordEmail,
      },
    });

    const maildetails = {
      from: `NOTES APP <${adminEmail}>`,
      to: email,
      subject: "Verification your email",
      text: "You recieved message from " + adminEmail,
      html: `<p style="font-size: 24px;">Your verification code is: <h1>${code}</h1></p>`,
    };

    const sendMAil = await transporter.sendMail(maildetails);
    await client.HSET(`${key}MAIL`, "verifyCode", code);
    await client.EXPIRE(`${key}MAIL`, 60);
    return sendMAil;
  } catch (error) {
    console.log({ errorInSendMail: error });
    throw new Error(error);
  }
}

module.exports = { sendEmail };
