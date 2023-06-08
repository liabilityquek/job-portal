const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const sendEmail = async (options) => {
    const template = fs.readFileSync(
      path.resolve(__dirname, `../email_html/${options.templateName}.html`),
      "utf-8"
    );
    
    const html = ejs.render(template, options.templateVariables);
    const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html: html,

  };
//   console.log(mailOptions.html);
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
