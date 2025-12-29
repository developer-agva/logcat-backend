const Sib = require("sib-api-v3-sdk");
require("dotenv").config();

const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.API_KEY;

async function sendDeviceInactiveEmail(
    to,
    tableContent
) {
    try {
        const tranEmailApi = new Sib.TransactionalEmailsApi();

        const sender = {
            email: "nadeem@agvahealthtech.com",
            name: "AgVa Healthcare",
        };

        const receivers = [
            {
                email: to,
            },
        ];

        tranEmailApi
            .sendTransacEmail({
                sender,
                to: receivers,
                subject:
                    "Urgent: AgVa Ventilator Critical Alarm Alert - Immediate Action Required",
                textContent: `Urgent: AgVa Ventilator Critical Alarm Alert.`,
                htmlContent: `<!DOCTYPE html>
                        <html lang="en">

                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Responsive Email Template</title>
                            <style>
                                /* Reset styles for email compatibility */
                                body {
                                    margin: 0;
                                    padding: 0;
                                    font-family: Arial, sans-serif;
                                    background-color: #f4f4f4;
                                }

                                .container {
                                    max-width: 600px; /* Email width */
                                    margin: 0 auto;
                                    background-color: #ffffff;
                                    padding: 20px;
                                    border-radius: 8px;
                                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                }

                                .header {
                                    text-align: center;
                                    color: #98004c;
                                    font-size: 24px;
                                }

                                .content {
                                    margin: 20px 0;
                                    font-size: 14px;
                                    line-height: 1.6;
                                    color: #333333;
                                }

                                table {
                                    width: 100%;
                                    border-collapse: collapse;
                                }

                                th, td {
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                    text-align: left;
                                    font-size: 12px;
                                }

                                th {
                                    background-color: #f2f2f2;
                                }

                                .footer {
                                    text-align: center;
                                    font-size: 12px;
                                    color: #999999;
                                    margin-top: 20px;
                                }

                                /* Responsive styles */
                                @media only screen and (max-width: 600px) {
                                    .container {
                                        padding: 15px;
                                    }

                                    .header {
                                        font-size: 20px;
                                    }

                                    .content {
                                        font-size: 12px;
                                    }

                                    th, td {
                                        font-size: 10px;
                                        padding: 8px;
                                    }
                                }
                            </style>
                        </head>

                        <body>
                            <table role="presentation" class="container" align="center" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td>
                                        <h1 class="header">AgVa Healthcare</h1>
                                        <p class="content">Greetings,</p>
                                        <p class="content">
                                            List of inactive ventilators, inactive since last 
                                            <strong style="color:red;">24 Hrs</strong>.
                                        </p>
                                        <table>
                                            <tr>
                                                <th>Serial Number</th>
                                                <th>Device ID</th>
                                                <th>Hospital Name</th>
                                                <th>Total Hours</th>
                                                <th>Device Status</th>
                                            </tr>
                                            ${tableContent?tableContent:""}
                                        </table>
                                        <div class="footer">
                                            <p>Registered trademark (A-1 AgVa Healthcare, Sector 83, Noida UP)</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                        </body>

                        </html>
                        `,
                params: {
                    role: "Frontend",
                },
            })
            .then(console.log)
            .catch(console.log);
    } catch (error) {
        console.log(`Error sending email :`, error);
    }
}

module.exports = sendDeviceInactiveEmail;
