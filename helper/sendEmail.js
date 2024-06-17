const nodemailer = require('nodemailer');
// require('dotenv').config('../.env');
const pug = require("pug");
const htmlToText = require("html-to-text");

async function sendEmail(to, subject, text) {
    try {
        // Create emtp transporter for sending email
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            // host: 'smtp.gmail.com',
            // port: 465,
            // secure: true,
            auth: {
                user: 'shivprakash@agvahealthtech.com', // like : abc@gmail.com
                pass: 'zcdydzalkidbpyfq'           // like : pass@123
            }
        });
        // Define the email options
        const mailOptions = {
            from : 'shivprakash@agvahealthtech.com',
            to : to,
            subject : subject,
            text : '<p>Please click on the following link to verify your email address:</p>' +
            '<a href="http://localhost:3000/verify/' +
            '">http://localhost:3000/verify/'+
              '</a>',
        }

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent :', info.messageId);

    } catch (error) {
        console.log(`Error sending email :`, error);
    }
}


module.exports = sendEmail;