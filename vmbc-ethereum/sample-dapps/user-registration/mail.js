const sendmail = require('sendmail')();
 
sendmail({
    from: 'ramkri123@gmail.com',
    to: 'ramkik@vmware.com',
    subject: 'test sendmail',
    html: 'Mail of test sendmail ',
  }, function(err, reply) {
    console.log(err && err.stack);
    console.dir(reply);
});
