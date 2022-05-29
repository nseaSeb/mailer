require('dotenv').config()
var express = require('express');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
var bodyParser = require('body-parser');
var path = require('path');
var router = express.Router();



const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET,process.env.REDIRECT_URI)
oAuth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN})

var app = express();
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', function(req, res) {
        res.send('Serveur is running...');
    });
    router.use(function (req, res, next) {
        console.log('router.use()');
        // .. some logic here .. like any other middleware
        next()
    })

  router.post('/send', (req, res, next) => {
    // console.log('Body receive in post:', req.body);
    var mail = {
      from: req.body.from,
      to: req.body.to,  //Change to email address that you want to receive messages on
      subject: req.body.subject,
      cc: req.body.cc,
      bcc: req.body.bcc,
      html: req.body.html,
      attachments: []
    }
    
    if (req.body.attachments && req.body.attachments.length > 0){
        req.body.attachments.forEach(value => {
          mail.attachments.push(value);
        })
    }
    console.log('mail', mail);
    sendEmail(mail)
    .then(result => {console.log('result ok', result);   res.send(result);})
    .catch(error => {console.log('error', error);   res.send(error);});
 
  });

  app.use(router);
  app.listen(3000, () => {
    console.log(`Example app listening on port 3000`)
  })

async function sendEmail(mail){
    console.log('sendMail', mail);
    try {
        const accesToken = await oAuth2Client.getAccessToken()
        .catch(error => {
            console.log('erreur accessToken', error);
        });
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'croqumaterre17@gmail.com',
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accesToken
            }
        })
 
        const result = await transport.sendMail(mail)
        return result
    } catch (error) {
        return error;
    }
}