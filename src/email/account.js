const sgMail = require('@sendgrid/mail');
const API_KEY="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"
sgMail.setApiKey(API_KEY)
const msg={
    to:"17tucs148@skct.edu.in",
    from:"rahulravi0699@gmail.com",
    subject: 'Sending with Twilio SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })