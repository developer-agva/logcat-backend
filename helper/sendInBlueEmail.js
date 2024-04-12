const Sib = require('sib-api-v3-sdk');
require('dotenv').config()

const client = Sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.API_KEY


async function sendInBlueEmail(to) {
    try {
        const tranEmailApi = new Sib.TransactionalEmailsApi();

        const sender = {
            email: 'shivprakash@agvahealthtech.com',
            name: 'AgVa Health Care',
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
                subject: 'Welcome to Logcat',
                textContent: `
                 This is email verification mail.              
                `,
                htmlContent: `<!doctype html>
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                    <title>Email verification link</title>
                    <style>
                @media only screen and (max-width: 620px) {
                  table.body h1 {
                    font-size: 28px !important;
                    margin-bottom: 10px !important;
                  }
                
                  table.body p,
                table.body ul,
                table.body ol,
                table.body td,
                table.body span,
                table.body a {
                    font-size: 16px !important;
                  }
                
                  table.body .wrapper,
                table.body .article {
                    padding: 10px !important;
                  }
                
                  table.body .content {
                    padding: 0 !important;
                  }
                
                  table.body .container {
                    padding: 0 !important;
                    width: 100% !important;
                  }
                
                  table.body .main {
                    border-left-width: 0 !important;
                    border-radius: 0 !important;
                    border-right-width: 0 !important;
                  }
                
                  table.body .btn table {
                    width: 100% !important;
                  }
                
                  table.body .btn a {
                    width: 100% !important;
                  }
                
                  table.body .img-responsive {
                    height: auto !important;
                    max-width: 100% !important;
                    width: auto !important;
                  }
                }
                @media all {
                  .ExternalClass {
                    width: 100%;
                  }
                
                  .ExternalClass,
                .ExternalClass p,
                .ExternalClass span,
                .ExternalClass font,
                .ExternalClass td,
                .ExternalClass div {
                    line-height: 100%;
                  }
                
                  .apple-link a {
                    color: inherit !important;
                    font-family: inherit !important;
                    font-size: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                    text-decoration: none !important;
                  }
                
                  #MessageViewBody a {
                    color: inherit;
                    text-decoration: none;
                    font-size: inherit;
                    font-family: inherit;
                    font-weight: inherit;
                    line-height: inherit;
                  }
                
                  .btn-primary table td:hover {
                    background-color: #34495e !important;
                  }
                
                  .btn-primary a:hover {
                    background-color: #34495e !important;
                    border-color: #34495e !important;
                  }
                }
                </style>
                  </head>
                  <body style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
                    <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">Verify Your Account.</span>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
                      <tr>
                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                        <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
                          <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
                
                            <!-- START CENTERED WHITE CONTAINER -->
                            <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">
                
                              <!-- START MAIN CONTENT AREA -->
                              <tr>
                                <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                                    <tr>
                                      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hi ${to},</p>
                                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Welocme To AgVa Health Care. Before we get started, please confirm your email address. </p>
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;" width="100%">
                                          <tbody>
                                            <tr>
                                              <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                                  <tbody>
                                                    <tr>
                                                    <td style="font-family: sans-serif; padding-left: 40px; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;"><a href="https://google.com" target="_blank">Verify Now</a></td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">This is a really simple email template. Its sole purpose is to get the recipient to click the button with no distractions.</p>
                                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Good luck! Hope it works.</p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                
                            <!-- END MAIN CONTENT AREA -->
                            </table>
                            <!-- END CENTERED WHITE CONTAINER -->
                
                            <!-- START FOOTER -->
                            <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                                <tr>
                                 
                                </tr>
                                <tr>
                                 
                                </tr>
                              </table>
                            </div>
                            <!-- END FOOTER -->
                
                          </div>
                        </td>
                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
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

module.exports = sendInBlueEmail