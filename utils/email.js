const nodemailer = require('nodemailer');
const pug = require('pug');
const {htmlToText} = require('html-to-text');

class Email {
  constructor(user, url, info) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = process.env.EMAIL_FROM;
    this.info = info;
  }

  // create transporter configuration
  createTransport () {
    // mailtrap smtp in development
    if (process.env.NODE_ENV === 'development') {
      return nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "d207bc59998b1f",
          pass: "1bb877e911c2be",
        },
      });
    }

    // sendgrid smtp in production
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST, 
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  
  // send email
  async send (template, subject) {
   try {
      // (1) Render HTML template based on a pug template
      const html = pug.renderFile(`${__dirname}/../views/templates/emails/${template}.pug`, {subject, firstName: this.firstName, url: this.url, info: this.info});

      // (2) Define the email options
      const options = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText(html)
      }

      // (3) actually send the email
     const info = await this.createTransport().sendMail(options);
     return info;
   } catch (error) {
      console.log(error);
   }
  }

  // send welcome email
  async sendWelcome () { await this.send('welcome', 'Welcome to the natours family') };
  
  // send password reset email
  async sendPasswordReset () { await this.send('passwordReset', 'Your password reset token (only valid for 10 minutes)') }
  
  // send password reset confirmation email
  async sendpasswordResetConfrim() { await this.send('passwordResetConfirm', 'You password has been reset successully!')}
};


module.exports = Email;