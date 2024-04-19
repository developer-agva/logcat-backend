const Sib = require('sib-api-v3-sdk');
require('dotenv').config()

const client = Sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.API_KEY


const sendOtp = async function sendOtp(to, otp) {
  try {
    const tranEmailApi = new Sib.TransactionalEmailsApi();

    const sender = {
      email: 'shivprakash@agvahealthtech.com',
      name: 'AgVa Health Care',
    }

    const receivers = [
      {
        email: to,
        // otpVerify:otp,
      },
    ]

    tranEmailApi
      .sendTransacEmail({
        sender,
        to: receivers,
        subject: 'Welcome to Logcat ',
        textContent: `
                This is otp verification email.
                `,
        htmlContent: `<!doctype html>
        <html>
        
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <title>Submit Feedback</title>
          <style>
            @media only screen and (max-width: 620px) {
              table.body h1 {
                font-size: 28px !important;
                margin-bottom: 10px !important;
              }
        
              .submitBtn {
                border: 0px;
                color: white;
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
        
        <body
          style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
          <span class="preheader"
            style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">.</span>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body"
            style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;"
            width="100%" bgcolor="#f6f6f6">
            <tr>
              <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
              <td class="container"
                style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;"
                width="580" valign="top">
                <div class="content"
                  style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
        
                  <table role="presentation" class="main"
                    style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;"
                    width="100%">
        
                    <tr>
                      <td class="wrapper"
                        style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"
                        valign="top">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0"
                          style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                          width="100%">
                          <tr>
                            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                              <p
                                style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                               <img src="https://i.ibb.co/xfngMWf/lgnewsmall.png" style='width: 2rem;'>
                              </p>
                              <h2>Hello From AgVa Team!</h2>  
                              <h5
                                style="font-family: sans-serif; font-size: 14px;  margin: 0; margin-bottom: 15px;">
                                Hi, ${to}</h5>
                              <h5
                                style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                                We hope you're having a lovely day.</h5>
                              <h5
                                style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                                Thank you for choosing AgVa Healthcare. Use the following OTP to complete your verification email procedures. OTP is valid for 5 minutes .
                                <br>
                              <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">
                                ${otp}</h2>
                                <br>
                                <h5
                                style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                                Thank You,</h5>
                              </h5>
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary"
                                style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;"
                                width="100%">
                                <tbody>
                                  <tr>
                                    <td align="left"
                                      style="font-family: sans-serif; font-size: 14px; vertical-align: top;"
                                      valign="top">
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0"
                                        style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                        <tbody>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <h5
                                style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                                Good luck! Hope it works.</h5>
                                <hr>
                                <h5
                                style="display: flex;align-items: center; justify-content: center; font-family: sans-serif; font-size: 10px; font-weight: normal; margin: 0; margin: 15px 0px;text-align: center;">
                                <img src="https://i.ibb.co/yBXyHN4/agva-healthcare-logo.png" style="width: 10rem;"> </h5>
                                <h5 style="font-family: sans-serif; font-size: 10px; font-weight: normal; margin: 0; margin-bottom: 15px;text-align: center;">
                                ©Copyright 2023 A-1 Sector 83 Agva Healthcare Pvt Ltd.</h5>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
        
                  </table>
        
                  <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
        
                  </div>
        
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

// send email link
const sendEmailLink = async function sendEmailLink(to, link) {
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
        subject: 'Feedback Form',
        textContent: `
              This is feedback url email.
              `,
        htmlContent: `<!doctype html>
              <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <title>Submit Feedback</title>
                <style>
                  @media only screen and (max-width: 620px) {
                    table.body h1 {
                      font-size: 28px !important;
                      margin-bottom: 10px !important;
                    }
                    .submitBtn {
                      border:0px;background-color:black;border-radius:4px;padding:10px;width:60%;margin:1rem 0rem;color:white;
                    }
                    .addressPara{
                      font-family: sans-serif; font-size: 8px; font-weight: normal; margin: 0; margin-bottom: 15px;text-align: center;
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
                    .submitBtn {
                      border:0px;background-color:black;border-radius:4px;padding:10px;width:30%;margin:1rem 0rem;color:white;
                    }
                    .addressPara{
                      font-family: sans-serif; font-size: 10px; font-weight: normal; margin: 0; margin-bottom: 15px;text-align: center;
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
              
              <body
                style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
                <span class="preheader"
                  style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">.</span>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body"
                  style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;"
                  width="100%" bgcolor="#f6f6f6">
                  <tr>
                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                    <td class="container"
                      style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;"
                      width="580" valign="top">
                      <div class="content"
                        style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
              
                        <table role="presentation" class="main"
                          style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;"
                          width="100%">
              
                          <tr>
                            <td class="wrapper"
                              style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"
                              valign="top">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0"
                                style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                                width="100%">
                                <tr>
                                  <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                                    <p
                                      style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                                     <img src="https://i.ibb.co/xfngMWf/lgnewsmall.png" style='width: 2rem;'>
                                    </p>
                                    <h2>Hello From AgVa Team!</h2>
                                    <p
                                      style="font-family: sans-serif; font-size: 14px;  margin: 0; margin-bottom: 15px;">
                                      Hii, ${to}</p>
                                    <p
                                      style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                                      We hope you're having a lovely day.</p>
                                    <p
                                      style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                                      We love hearing from our customers and use your feedback constructively to improve our products
                                      and services Please share your feedback.
                                      <br>
                                      <button
                                       class='submitBtn'>${link}</button>
                                      <br>
                                      Thank You,
                                    </p>
                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary"
                                      style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;"
                                      width="100%">
                                      <tbody>
                                        <tr>
                                          <td align="left"
                                            style="font-family: sans-serif; font-size: 14px; vertical-align: top;"
                                            valign="top">
                                            <table role="presentation" border="0" cellpadding="0" cellspacing="0"
                                              style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                              <tbody>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <p
                                      style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                                      Good luck! Hope it works.</p>
                                      <hr>
                                      <p
                                      style="display: flex;align-items: center; justify-content: center; font-family: sans-serif; font-size: 10px; font-weight: normal; margin: 0; margin: 15px 0px;text-align: center;">
                                      <img src="https://i.ibb.co/yBXyHN4/agva-healthcare-logo.png" style="width: 10rem;"> </p>
                                      <p class='addressPara'
                                      >
                                      ©Copyright 2023 A-1 Sector 83 Agva Healthcare Pvt Ltd.</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
              
                        </table>
              
                        <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
              
                        </div>
              
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


// send email link
const sendPrintFileLink = async function sendPrintFileLink(to, link) {
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
        subject: 'This is Print attachment email',
        textContent: `
              This is Print attachment email.
              `,
        // htmlContent:"<p>hello</p>",      
        htmlContent: `<!doctype html>
              <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <title>Submit Feedback</title>
                <style>
                  @media only screen and (max-width: 620px) {
                    table.body h1 {
                      font-size: 28px !important;
                      margin-bottom: 10px !important;
                    }
                    .submitBtn {
                      border:0px;background-color:black;border-radius:4px;padding:10px;width:60%;margin:1rem 0rem;color:white;
                    }
                    .addressPara{
                      font-family: sans-serif; font-size: 8px; font-weight: normal; margin: 0; margin-bottom: 15px;text-align: center;
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
                    .submitBtn {
                      border:0px;background-color:black;border-radius:4px;padding:10px;width:30%;margin:1rem 0rem;color:white;
                    }
                    .addressPara{
                      font-family: sans-serif; font-size: 10px; font-weight: normal; margin: 0; margin-bottom: 15px;text-align: center;
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
              
              <body
                style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
                <span class="preheader"
                  style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">.</span>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body"
                  style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;"
                  width="100%" bgcolor="#f6f6f6">
                  <tr>
                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                    <td class="container"
                      style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;"
                      width="580" valign="top">
                      <div class="content"
                        style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
              
                        <table role="presentation" class="main"
                          style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;"
                          width="100%">
              
                          <tr>
                            <td class="wrapper"
                              style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"
                              valign="top">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0"
                                style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                                width="100%">
                                <tr>
                                  <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                                    <p
                                      style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                                     <img src="https://i.ibb.co/xfngMWf/lgnewsmall.png" style='width: 2rem;'>
                                    </p>
                                    <h2>Hello, From AgVa Team!</h2>
                                    <p
                                      style="font-family: sans-serif; font-size: 14px;  margin: 0; margin-bottom: 15px;">
                                      Dear ${to},</p>
                                    <p
                                      style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                                      We hope you're having a lovely day.</p>
                                    <p
                                      style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                                      Please be informed that an important document is attached to this email for your review and action.
                                      The document, requires your immediate attention. 
                                      <br>
                                      <button
                                       class='submitBtn'>${link}</button>
                                      <br>
                                      Thank You,
                                    </p>
                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary"
                                      style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;"
                                      width="100%">
                                      <tbody>
                                        <tr>
                                          <td align="left"
                                            style="font-family: sans-serif; font-size: 14px; vertical-align: top;"
                                            valign="top">
                                            <table role="presentation" border="0" cellpadding="0" cellspacing="0"
                                              style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                              <tbody>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <p
                                      style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                                      Good luck! Hope it works.</p>
                                      <hr>
                                      <p
                                      style="display: flex;align-items: center; justify-content: center; font-family: sans-serif; font-size: 10px; font-weight: normal; margin: 0; margin: 15px 0px;text-align: center;">
                                      <img src="https://i.ibb.co/yBXyHN4/agva-healthcare-logo.png" style="width: 10rem;"> </p>
                                      <p class='addressPara'
                                      >
                                      ©Copyright 2023 A-1 Sector 83 Agva Healthcare Pvt Ltd.</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
              
                        </table>
              
                        <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
              
                        </div>
              
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


module.exports = {
  sendOtp,
  sendEmailLink,
  sendPrintFileLink
}