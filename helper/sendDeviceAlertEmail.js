const Sib = require('sib-api-v3-sdk');
require('dotenv').config()

const client = Sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.API_KEY


async function sendDeviceAlertEmail(to, did, msg, formattedDate, formattedTime) {
    try {
        const tranEmailApi = new Sib.TransactionalEmailsApi();

        const sender = {
            email: 'nadeem@agvahealthtech.com',
            name: 'AgVa Healthcare',
        }

        const receivers = [
            {
                email: to,
            },
        ]

        tranEmailApi
            .sendTransacEmail({
                sender,
                to: receivers,
                subject: 'Urgent: AgVa Ventilator Critical Alarm Alert - Immediate Action Required',
                textContent: `Urgent: AgVa Ventilator Critical Alarm Alert.`,
                htmlContent: `<!DOCTYPE html>
                <html lang="en">

                <head>
                      <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Modern Responsive Email Template</title>
                    <style>
                        @media only screen and (max-width: 600px) {
                            .email-container {
                                width: 100% !important;
                                padding: 0 !important;
                            }
                            .content {
                                padding: 10px !important;
                            }
                            .button {
                                padding: 10px 20px !important;
                                font-size: 16px !important;
                            }
                        }
                    </style>
                </head>

                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
                        <tr>
                            <td align="center" style="padding: 20px;">
                                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <tr>
                                        <td align="center" style="padding-bottom: 20px;">
                                            <h1 style="color: #333333; font-size: 24px; margin: 0;">AgVa Healthcare</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 20px; color: #555555; font-size: 16px; line-height: 1.5;">
                                            <p style="margin: 0 0 20px;">Greetings,</p>
                                            <p style="margin: 0 0 20px;">This is an automated alert to inform you, the AgVa Ventilator present at your facility has triggered a <strong style="color:red;">CRITICAL ALARM</strong>.</p>
                                  
                                            <p style="margin: 0;">Device Id:- <strong>${did}</strong></p>
                                            <h4 style="background-color" >Priority:- CRITICAL</h4>
                                            <p style="background-color:red;color:white;display:inline-block;font-size:20px;padding:5px;">${msg}</p>
                                                              <p style="margin: 0;">Date - ${formattedDate}</p>
                                                                <p style="margin: 0;">Time - ${formattedTime}</p>
                                                                <p>Our service engineer is sent to your location,to provide solution for this concern.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding: 20px;">
                                            <a href="http://medtap.in/" style="background-color: #4CAF50; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Get Info</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 20px; color: #999999; font-size: 12px; text-align: center;">
                                            <p style="margin: 0;">Registered trademark ( A-1 AgVa Healthcare, Sector 83, Noida UP)</p>
                                        
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>

                </html>`,
                params: {
                    role: 'Frontend',
                },
            })
            .then(console.log)
            .catch(console.log)
    } catch (error) {
        console.log(`Error sending email :`, error);
    }
  }

// async function sendSMS() {
//     try {
//         let apiKey = client.authentications['api-key'];
//         apiKey.apiKey = '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';

//         let apiInstance = new Sib.TransactionalSMSApi();

//         let sendTransacSms = new Sib.SendTransacSms();

//         sendTransacSms = {
//             "sender": "AgVa",
//             "recipient": "7007587700",
//             "content": "AgVa SMS verification",
//         };

//         apiInstance.sendTransacSms(sendTransacSms).then(function (data) {
//             console.log('API called successfully. Returned data: ' + JSON.stringify(data));
//         }, function (error) {
//             console.error(error);
//         });
//     } catch (error) {
//         console.error(error);
//     }
// }

module.exports = sendDeviceAlertEmail