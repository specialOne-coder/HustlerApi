// const nodemailer = require('nodemailer');

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'frdndattivi@gmail.com',
//         pass: 'ferdinand8918',
//     }
// });

// var mailOptions = {
//     from: 'frdndattivi@gmail.com',
//     to: 'ferdiattivi@gmail.com',
//     subject: 'Mot de passe oublié',
//     text: 'test denvoi de mail depuis node',
// };

// transporter.sendMail(mailOptions, (err, info) => {
//     if (err) console.log(err);
//     else console.log('Email envoyé ' + info.response);
// })

const {sendEmail} = require('./controllers/auth.controller');

sendEmail('ferdiattivi@gmail.com','bonjour');
