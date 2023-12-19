// const twilio = require('twilio');
// const accountSid = 'ACc0e61f942e6af0e1f53875f469830ef9';
// const authToken = '515f24ec71a18ccd103dbe7e1c33c4f3';

// const twilioPhone = '+12057496028';
// const recipientPhone = '+917007587700';
// const client = new twilio(accountSid, authToken);  

// async function sendSms() {
//     try {
//         client.messages
//             .create({
//                 body: 'Hello, this is a test message from AgVa Healthcare! You One Time Verification Code is : 2290',
//                 from: twilioPhone,
//                 to: recipientPhone
//             })
//             .then(message => console.log(`Message sent with SID: ${message.sid}`))
//             .catch(error => console.error(`Error sending message: ${error.message}`));
//     } catch (error) {
//        console.log(`Error while sending otp on mobile.`);
//     }
// }


// module.exports = sendSms;