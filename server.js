/*
| [ Web Hacking Tool - GoogleX ]
| 
|
| Copyright (c) 2018
*/

/* Const variable */

const express = require('express');
const Recaptcha = require('express-recaptcha');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const fs = require('fs');
const unirest = require('unirest');
const util = require("util");
const path = require('path');
const rp = require('request-promise');
const request = require('request');
const fileUpload = require('express-fileupload');
const main = require('./pkg/main');
const mime = require('mime-types');

/* Global Var */

var xsess;
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });
var app = express();

/* Web */

app.use(cookieParser());
app.use(session({secret: 'host'}));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', 'pages');
app.set('view engine', 'ejs');

app.get('/', csrfProtection, function(req, res){
  res.render('index', { name: Math.floor(Math.random()*900000) + 100000, csrftoken: req.csrfToken() });
});

/*app.use(function(req, res, next){
  xsess = req.session;
  let urlPath = req.url.split("/");// urlPath[0] = null
});*/
 
app.post('/sendfile', parseForm, csrfProtection, function(req, res){
	if (!req.files.files){return res.status(400).send('No files were uploaded.');}else{
		let fi = req.files.files;
		console.info(fi.data.length);
		let fullname = './uploads/'+req.body.name.replace(/\.\.\//g,'-').replace(/\//g,'-')+'/'+fi.name.replace(/\.\.\//g,'-').replace(/\//g,'-');
		if(!req.body.name){return res.status(400).send('Username undefined.');}
		else if(!fi.name){return res.status(400).send('Filename undefined.');}
		else if(!Number.isInteger(parseInt(req.body.name))){return res.status(500).send('Username invalid');}
		else if(fi.data.length > 50000000){return res.status(500).send('File is too big.');}
		if(!fs.existsSync('./uploads/'+req.body.name.replace(/\.\.\//g,'-').replace(/\//g,'-'))){fs.mkdirSync('./uploads/'+req.body.name.replace(/\.\.\//g,'-').replace(/\//g,'-'))}
              fi.mv(fullname, function(err) {
              if (err){return res.status(500).send(err);}
 
                 res.send(fullname);
				 console.info(fullname);
        });
	}
    //});
});

app.get('/uploads/:name/:file', function(req, res){
	res.setHeader('content-type', 'text/plain');
	fs.readFile('./uploads/'+req.params.name+'/'+req.params.file, (err, data) => {
        if (err) {return res.status(500).send('Error');};
		let mim = mime.lookup('./uploads/'+req.params.name+'/'+req.params.file);
		if(mim == false){return res.send(data);}
		let detX = mim.split('/');//console.info(mim);
		switch(detX[0]){
		   case 'video':
		       res.setHeader('content-type', mim);
			   res.send(data);
		   break;
		   case 'image':
		       res.setHeader('content-type', mim);
			   res.send(data);
		   break;
		   default:
		       res.setHeader('content-type', 'text/plain');
			   res.send(data);
		}
    });
});

app.listen(80, function () {
  console.log('\nREADY !\nServer running on 127.0.0.1:80')
});

process.on('uncaughtException', function (err) {
    console.info("Something make me cry \n"+err);

});