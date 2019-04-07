const nodeMailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify  = require('es6-promisify');
const pug =  require('pug');

const transport = nodeMailer.createTransport(sgTransport({
    service: 'SendGrid',
    auth: {
      api_key: process.env.SENDGRID_API,
    }
  }));

  const generateHTML  = (filename, options = {}) => {
      const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
      const inlined  = juice(html);
      return inlined;
  };

     exports.send = async (options) => {
         const html = generateHTML(options.filename, options);
         const text = htmlToText.fromString(html)
         const mailOptions = {
            from: 'Now That\'s Delicious <no-reply@nowthatsdelicious.com>',
            to: options.user.email,
            subject: options.subject,
            html, 
            text
       
         };
         const sendMail = promisify(transport.sendMail, transport);
         return sendMail(mailOptions);
     }