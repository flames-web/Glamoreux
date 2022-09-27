const nodemailer = require("nodemailer");
const {google} = require('googleapis');

const CLIENT_ID = process.env.CLIENT_ID;
const CLEINT_SECRET = process.env.CLEINT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
CLIENT_ID,
CLEINT_SECRET,
REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

module.exports.sendMail = async (params) => {
try {
const accessToken = await oAuth2Client.getAccessToken();

const transport = nodemailer.createTransport({
service: 'gmail',
auth: {
type: 'OAuth2',
user: 'glamoreoux0@gmail.com',
clientId: CLIENT_ID,
clientSecret: CLEINT_SECRET,
refreshToken: REFRESH_TOKEN,
accessToken: accessToken,
},
});

const mailOptions = {
from: 'Task <yours authorised email rajiolalekanh247@gmail.com>',
to: params.to,
subject: params.subject,
text:params.text,
html: params.html,
};

const result = await transport.sendMail(mailOptions);
return result;
} catch (error) {
return error;
}
}