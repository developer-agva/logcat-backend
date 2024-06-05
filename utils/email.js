const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user;
    this.firstName = user.split("@")[0];
    this.url = url;
    this.from = `LogCat  <${process.env.MAIL_FROM}>`;
    // console.log("user", user, url);
  }

  newTransport() {
    // if (process.env.NODE_ENV === "PRODUCTION") {
    //   // Sendgrid
    //   return 1;
    //   // console.log("this code is running");
    // }

    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML from a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // console.log("html", html);

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // console.log("mailOptions", mailOptions);

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("error", err);
      }
      // console.log("info", info);
    });
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to LogCat!");
  }

  async sendCrash() {
    this.send("crash", "Crash Notification: LogCat");
  }

  async forgetPassword() {
    await this.send("forgetPassword", "Password Reset OTP: LogCat");
  }
};
