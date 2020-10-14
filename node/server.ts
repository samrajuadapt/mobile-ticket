import * as proxy from "express-http-proxy";
import * as express from "express";
import * as compression from "compression";
import * as zlib from "zlib";
import * as expressStaticGzip from "express-static-gzip";
import * as fs from "fs";
import * as https from "https";
import * as path from "path";

import * as helmet from "helmet";
import * as hidePoweredBy from "hide-powered-by";
import * as csp  from "helmet-csp";
import * as nocache  from "nocache";
import * as nosniff  from "dont-sniff-mimetype";
import * as frameguard  from "frameguard";
import * as xssFilter  from "frameguard";

import { OtpRoutes } from "./mt-service/src/routes/otp.routes";
import { connectDB } from "./mt-service/src/data-module/database";
import bodyParser = require("body-parser");

const app: express.Application = express();

let configFile = 'proxy-config.json';
let host = 'localhost:9090';
let authToken = 'nosecrets';
let port = '80';
let sslPort = '4443';
let supportSSL = false;
let validAPIGWCert = "1";
let APIGWHasSSL = true;
let isEmbedIFRAME = false;
let tlsVersion = '';
let hstsExpireTime = '63072000';
let tlsversionSet = ['TLSv1_method', 'TLSv1_1_method', 'TLSv1_2_method'];
let cipherSet = [];

const google_analytics = 'https://www.google-analytics.com';
const bootstarp_cdn = 'https://maxcdn.bootstrapcdn.com';

// Enable packet compression of each response
app.use(compression({level: zlib.Z_BEST_COMPRESSION, strategy: zlib.Z_DEFAULT_STRATEGY}));
// Set route to fetch compressed content
if (fs.existsSync('./src/zip')) {
   app.use("/zip", expressStaticGzip(__dirname + '/src/zip', {
	   enableBrotli: false,
    customCompressions: [{
        encodingName: "gzip",
        fileExtension: "gz"
    }]
   }));
}


//update configurations using config.json
const configuration = JSON.parse(
	fs.readFileSync(configFile, "utf8")
);
// //update user-configurations using config.json for functional server
// var userConfiguration = JSON.parse(
// 	fs.readFileSync(userConfigFile)
// );

//Set well-known web vulnerabilities by setting HTTP headers appropriately
app.use(helmet());

//Hackers can exploit known vulnerabilities in Express/Node if they see that your site is 
//powered by Express (or whichever framework you use)
app.use(hidePoweredBy());

//Abolish all JS client-side caching.
app.use(nocache());

//Browsers will try to "sniff" mimetypes. For example, if my server serves file.txt with a text/plain content-type, 
//some browsers can still run that file with <script src="file.txt"></script>
app.use(nosniff());

//The X-Frame-Options HTTP header restricts who can put your site in a frame
// action either can be {action:'deny'}, {action:'sameorigin'}, {action: 'allow-from', domain: 'http://example.com'}
app.use(frameguard({ action: 'deny' }));

//The X-XSS-Protection HTTP header is a basic protection against XSS
app.use(xssFilter());

//Content Security Policy helps prevent unwanted content being injected into your webpages
app.use(csp({
	directives: {
	defaultSrc: ["'self'"],
	scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'",google_analytics ],
	styleSrc: ["'self'", "'unsafe-inline'",bootstarp_cdn],
	fontSrc: ["'self'", 'data:',bootstarp_cdn],
	imgSrc: ["'self'", 'data:', google_analytics],
	sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin', 'allow-popups'],
	reportUri: '/report-violation',
	objectSrc: ["'none'"]
	},
	// This module will detect common mistakes in your directives and throw errors
	// if it finds any. To disable this, enable "loose mode".
	loose: false,

	// Set to true if you only want browsers to report errors, not block them.
	// You may also set this to a function(req, res) in order to decide dynamically
	// whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.
	reportOnly: false,

	// Set to true if you want to blindly set all headers: Content-Security-Policy,
	// X-WebKit-CSP, and X-Content-Security-Policy.
	setAllHeaders: false,

	// Set to true if you want to disable CSP on Android where it can be buggy.
	disableAndroid: false,

	// Set to false if you want to completely disable any user-agent sniffing.
	// This may make the headers less compatible but it will be much faster.
	// This defaults to `true`.
	browserSniff: true
}));

host = configuration.apigw_ip_port.value;
port = configuration.local_webserver_port.value;
authToken = configuration.auth_token.value;
sslPort = configuration.local_webserver_ssl_port.value;
supportSSL = (configuration.support_ssl.value.trim() === 'true')?true:false;
validAPIGWCert = (configuration.gateway_certificate_is_valid.value.trim()=== 'true')?"1":"0";
APIGWHasSSL = (configuration.gateway_has_certificate.value.trim()=== 'true')?true:false;
isEmbedIFRAME = (configuration.embed_iFrame.value.trim() === 'true')?true:false;
tlsVersion = configuration.tls_version.value;
hstsExpireTime = configuration.hsts_expire_time.value;
cipherSet = configuration.cipher_set.value;

//this will bypass certificate errors in node to API gateway encrypted channel, if set to '1'
//if '0' communication will be blocked. So production this should be set to '0'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = validAPIGWCert;

let privateKey, certificate, credentials;

if (supportSSL) {
	privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
	certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

	credentials = { key: privateKey, cert: certificate };
	if (tlsVersion.length > 0 && tlsversionSet.indexOf(tlsVersion) !== -1) {
		credentials.secureProtocol = tlsVersion;
	} 
	if (cipherSet.length > 0) {
		credentials.ciphers = cipherSet.join(':');
	}
}

const options = {
	setHeaders: function (res, path, stat) {
		res = handleHeaders(res);
	}
}

app.use(express.static(__dirname + '/src', options));


// Redirect no_branch requests to index.html
app.get('/no_support$', (req, res) => {
	res = handleHeaders(res);
  	res.sendFile(path.join(__dirname + '/src', 'index.html'));
});

// Redirect no_branch requests to index.html
app.get('/no_branch$', (req, res) => {
	res = handleHeaders(res);
  	res.sendFile(path.join(__dirname + '/src', 'index.html'));
});

// Redirect fingerprint
app.get('/fingerprintjs2$', (req, res) => {
	res = handleHeaders(res);
  	res.sendFile(path.join(__dirname + '/src', 'fingerprint2.js'));
});
// Redirect no_visit requests to index.html
app.get('/no_visit$', (req, res) => {
	res = handleHeaders(res);
  	res.sendFile(path.join(__dirname + '/src', 'index.html'));
});

// Redirect all requests that start with branches and end, to index.html
app.get('/branches*', (req, res) => {
	res = handleHeaders(res);
  	res.sendFile(path.join(__dirname + '/src', 'index.html'));
});

// Redirect all requests that start with services and end, to index.html
app.get('/services$',  (req, res) => {
	res = handleHeaders(res);
  	res.sendFile(path.join(__dirname + '/src', 'index.html'));
});

// Redirect all requests that start with ticket info and end, to index.html
app.get('/ticket$',  (req, res) => {
	res = handleHeaders(res);
  	res.sendFile(path.join(__dirname + '/src', 'index.html'));
});

// Redirect all requests that start with branches and end, to index.html
app.get('/open_hours$', (req, res) => {
	res = handleHeaders(res);
  	res.sendFile(path.join(__dirname + '/src', 'index.html'));
});
// Redirect all requests that start with appointment and end, to index.html
app.get('/appointment$', (req, res) => {
	res = handleHeaders(res);
  	res.sendFile(path.join(__dirname + '/src', 'index.html'));
});

// Redirect all requests that start with customer data and end, to index.html
app.get('/customer_data$', (req, res) => {
	res = handleHeaders(res);
  	res.sendFile(path.join(__dirname + '/src', 'index.html'));
});

// Redirect all requests that start with privacy policy and end, to index.html
app.get('/privacy_policy$', (req, res) => {
	res = handleHeaders(res);
  	res.sendFile(path.join(__dirname + '/src', 'index.html'));
});

app.get('/cookie_consent$', (req, res) => {
	res = handleHeaders(res);
  	res.sendFile(path.join(__dirname + '/src', 'index.html'));
});

app.get('/otp_number$', (req, res) => {
	res = handleHeaders(res);
  	res.sendFile(path.join(__dirname + '/src', 'index.html'));
});

app.get('/otp_pin$', (req, res) => {
	res = handleHeaders(res);
  	res.sendFile(path.join(__dirname + '/src', 'index.html'));
});


// Proxy mobile example to API gateway
const apiProxy = proxy(host, {
	// ip and port off apigateway

	proxyReqPathResolver: function (req) {
		return require('url').parse(req.originalUrl).path;
	},
	proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
		proxyReqOpts.headers['auth-token'] = authToken		// api_token for mobile user
		proxyReqOpts.headers['Content-Type'] = 'application/json'
		return proxyReqOpts;
	},
	userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
		if (isEmbedIFRAME === false) {
			headers['X-Frame-Options'] = "DENY";
		}
		headers['Content-Security-Policy'] = "default-src \'self\'";
	
		if (supportSSL) {
			headers['Strict-Transport-Security'] = "max-age=" + hstsExpireTime + "; includeSubDomains";
		}
		return headers;
	},
	https: APIGWHasSSL
});

const apiFindProxy = proxy(host, {	// ip and port off apigateway
	proxyReqPathResolver: function (req) {
		var newUrl = req.originalUrl.replace("/MobileTicket/MyAppointment/find/","/rest/calendar-backend/api/v1/appointments/publicid/");
		return require('url').parse(newUrl).path;
	},
	proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
		proxyReqOpts.headers['auth-token'] = authToken		// api_token for mobile user
		proxyReqOpts.headers['Content-Type'] = 'application/json'
		return proxyReqOpts;
	},
	userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
		if (isEmbedIFRAME === false) {
			headers['X-Frame-Options'] = "DENY";
		}
		headers['Content-Security-Policy'] = "default-src \'self\'";
	
		if (supportSSL) {
			headers['Strict-Transport-Security'] = "max-age=" + hstsExpireTime + "; includeSubDomains";
		}
		return headers;
	},
	https: APIGWHasSSL,
	userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
		const data = JSON.parse(proxyResData.toString('utf8'));
		let newData = {};
		this.newData.appointment = {};
		if (data.appointment !== undefined) {
			this.newData.appointment.qpId = data.appointment.qpId
			this.newData.appointment.branch = data.appointment.branch;
			this.newData.appointment.start = data.appointment.start;
			this.newData.appointment.services = data.appointment.services;
		}
		return JSON.stringify(newData);
	}
});

const apiFindCentralProxy = proxy(host, {	// ip and port off apigateway
	proxyReqPathResolver: function (req) {
		var newUrl = req.originalUrl.replace("/MobileTicket/MyAppointment/findCentral/","/rest/appointment/appointments/");
		return require('url').parse(newUrl).path;
	},
	proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
		proxyReqOpts.headers['auth-token'] = authToken		// api_token for mobile user
		proxyReqOpts.headers['Content-Type'] = 'application/json'
		return proxyReqOpts;
	},
	userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
		if (isEmbedIFRAME === false) {
			headers['X-Frame-Options'] = "DENY";
		}
		headers['Content-Security-Policy'] = "default-src \'self\'";
	
		if (supportSSL) {
			headers['Strict-Transport-Security'] = "max-age=" + hstsExpireTime + "; includeSubDomains";
		}
		return headers;
	},
	https: APIGWHasSSL,
	userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
		const data = JSON.parse(proxyResData.toString('utf8'));
		let newData = {};
		if (data !== undefined) {
			this.newData.services = data.services;
			this.newData.status = data.status
			this.newData.branchId = data.branchId;
			this.newData.startTime = data.startTime;
			this.newData.endTime = data.endTime;
			this.newData.properties = {};
			this.newData.properties.notes = data.properties.notes;
		}
		return JSON.stringify(newData);
	}
});

const apiEntryPointProxy = proxy(host, {
	// ip and port off apigateway

	proxyReqPathResolver: function (req) {
		var newUrl = req.originalUrl.replace("/MobileTicket/MyAppointment/entrypoint/branches/","/rest/entrypoint/branches/");
		return require('url').parse(newUrl).path;
	},
	proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
		proxyReqOpts.headers['auth-token'] = authToken		// api_token for mobile user
		proxyReqOpts.headers['Content-Type'] = 'application/json'
		return proxyReqOpts;
	},
	userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
		if (isEmbedIFRAME === false) {
			headers['X-Frame-Options'] = "DENY";
		}
		headers['Content-Security-Policy'] = "default-src \'self\'";
	
		if (supportSSL) {
			headers['Strict-Transport-Security'] = "max-age=" + hstsExpireTime + "; includeSubDomains";
		}
		return headers;
	},
	https: APIGWHasSSL
});

const apiArriveProxy = proxy(host, {
	// ip and port off apigateway

	proxyReqPathResolver: function (req) {
		var newUrl = req.originalUrl.replace("/MobileTicket/MyAppointment/arrive/branches/","/rest/entrypoint/branches/");
		return require('url').parse(newUrl).path;
	},
	proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
		proxyReqOpts.headers['auth-token'] = authToken		// api_token for mobile user
		proxyReqOpts.headers['Content-Type'] = 'application/json'
		return proxyReqOpts;
	},
	userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
		if (isEmbedIFRAME === false) {
			headers['X-Frame-Options'] = "DENY";
		}
		headers['Content-Security-Policy'] = "default-src \'self\'";
	
		if (supportSSL) {
			headers['Strict-Transport-Security'] = "max-age=" + hstsExpireTime + "; includeSubDomains";
		}
		return headers;
	},
	https: APIGWHasSSL,
	userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
		const data = JSON.parse(proxyResData.toString('utf8'));
		let newData = {};
		this.newData.parameterMap = {};
		if (data !== undefined) {
			this.newData.id = data.id;
			this.newData.ticketId = data.ticketId;
			this.newData.currentVisitService = data.currentVisitService;
			this.newData.checksum = data.checksum;
			this.newData.parameterMap.startQueueOrigId = data.parameterMap.startQueueOrigId;
			this.newData.parameterMap.branchName = data.parameterMap.branchName;
		}
		return JSON.stringify(newData);
	}
});

const apiMeetingProxy = proxy(host, {
	// ip and port off apigateway

	proxyReqPathResolver: function (req) {
		var newUrl = req.originalUrl.replace("/MobileTicket/MyMeeting/branches/","/rest/entrypoint/branches/");
		return require('url').parse(newUrl).path;
	},
	proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
		proxyReqOpts.headers['auth-token'] = authToken		// api_token for mobile user
		proxyReqOpts.headers['Content-Type'] = 'application/json'
		return proxyReqOpts;
	},
	userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
		if (isEmbedIFRAME === false) {
			headers['X-Frame-Options'] = "DENY";
		}
		headers['Content-Security-Policy'] = "default-src \'self\'";
	
		if (supportSSL) {
			headers['Strict-Transport-Security'] = "max-age=" + hstsExpireTime + "; includeSubDomains";
		}
		return headers;
	},
	https: APIGWHasSSL,
	userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
		const data = JSON.parse(proxyResData.toString('utf8'));
		let newData = {};
		this.newData.parameterMap = {};
		if (data !== undefined) {
			this.newData.ticketId = data.ticketId;
			this.newData.checksum = data.checksum;
			this.newData.parameterMap.meetingUrl = data.parameterMap.meetingUrl;
			
		}
		return JSON.stringify(newData);
	}
});

// proxy for MT service
const apiOtpProxy = proxy('localhost:82', {
	// ip and port off apigateway
	proxyReqPathResolver: function (req) {
		console.log(req.originalUrl);
		return require('url').parse(req.originalUrl).path;
	},
	userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
		console.log(123);
		if (isEmbedIFRAME === false) {
			headers['X-Frame-Options'] = "DENY";
		}
		headers['Content-Security-Policy'] = "default-src \'self\'";
	
		if (supportSSL) {
			headers['Strict-Transport-Security'] = "max-age=" + hstsExpireTime + "; includeSubDomains";
		}
		return headers;
	},
	https: APIGWHasSSL
});

const handleHeaders = function (res) {
	if (isEmbedIFRAME === false) {
		res.set('X-Frame-Options', "DENY");
	} else {
		res.removeHeader('X-Frame-Options');
	}

	if (supportSSL) {
		res.set('Strict-Transport-Security', "max-age=" + hstsExpireTime +"; includeSubDomains");
	}
	return res;
}

app.post('/notification/*', (req, res) => {
	console.log('post hit');
});

app.use("/geo/branches/*", apiProxy);
app.use("/MobileTicket/branches/*", apiProxy);
app.use("/MobileTicket/MyAppointment/find/*", apiFindProxy);
app.use("/MobileTicket/MyAppointment/findCentral/*", apiFindCentralProxy);
app.use("/MobileTicket/MyAppointment/entrypoint/*", apiEntryPointProxy);
app.use("/MobileTicket/MyAppointment/arrive/*", apiArriveProxy);
app.use("/MobileTicket/services/*", apiProxy);
app.use("/MobileTicket/MyVisit/*", apiProxy);
app.use("/MobileTicket/MyMeeting/*", apiMeetingProxy);
// app.use("/MTService/*", apiOtpProxy);

// MT service
let env = process.argv[2] || 'prod';
let otpService = "disable";
let userConfigFile = "./src/app/config/config.json";
if (env=='dev') {
	userConfigFile = "../src/app/config/config.json";	
}
const userConfiguration = JSON.parse(fs.readFileSync(userConfigFile, "utf8"));
otpService = userConfiguration.otp_service.value;

if (otpService == 'enable') {
	console.log('MT service is running');
	const otpRoutes: OtpRoutes = new OtpRoutes();
	app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
	otpRoutes.route(app);
	connectDB();
}

if (supportSSL) {
	const httpsServer = https.createServer(credentials, app);
	httpsServer.listen(sslPort,  () => {
		const listenAddress = httpsServer.address()['address'];
		const listenPort = httpsServer.address()['port'];

		console.log("Mobile Ticket app listening at https://%s:%s over SSL", listenAddress, listenPort);
	});
} else{
	const server = app.listen(port, () => {  // port the mobileTicket will listen to.
	const listenAddress = server.address()['address'];
	const listenPort = server.address()['port'];

	console.log("Mobile Ticket app listening at http://%s:%s", listenAddress, listenPort);
});
}

