// module.exports.transport1 = async () => {
//     const transport = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       type: 'OAuth2',
//       user: 'rajiolalekanh247@gmail.com',
//       clientId: CLIENT_ID,
//       clientSecret: CLEINT_SECRET,
//       refreshToken: REFRESH_TOKEN,
//       accessToken: accessToken,
//     },
//   });
// };

// module.exports.mailOptions1 = async (from,email,subject,text,html,) => {
//     const mailOptions = { from, to:email,subject, text,html,}
//     const result = await transport.sendMail(mailOptions);
//     return result;
// }  