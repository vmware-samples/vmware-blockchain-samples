const nodemailer = require("nodemailer");

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateOtp = async () => {
    let otp = getRandomInt(1, 1000000);
    return otp;
}

const sendMailNow = async (email, otp) => {

    /*// create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465, // original 587
        secure: true, // true for 465, false for other ports
        auth: {
            user: "testethereumcontract@gmail.com", // replace with your email address
            pass: "Ethereum123#" // replace with your password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Test Ethereum Account" <testethereumcontract@gmail.com>', // sender address
        to: 'ramkri123@gmail.com, saanvijay20@gmail.com', // list of receivers
        subject: ' DID: User registration OTP', // Subject line
        text: '1234', // plain text body
        html: '<b>Decentralized identity example</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });*/



    const sendmail = require('sendmail')();
    sendmail({
        from: 'testethereumcontract@gmail.com',
        to: email,
        subject: 'DID: User registration OTP',
        text: otp.toString(),
        html: otp.toString(),
    }, function (err, reply) {
        console.log(err && err.stack);
        console.dir(reply);
    });
}

module.exports = { generateOtp, sendMailNow };
