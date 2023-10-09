const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
// const uuid = require('uuid/v4');
const bodyParser = require('body-parser')
const  express = require('express');
const { urlencoded, json } = require('body-parser');
const auth = require('./helpers/auth');
const app = express();
const path = __dirname + '/public';

require('dotenv').config();

// express setup
app.use(urlencoded({ extended: true }));
app.use(json());
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(passport.initialize());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app.use(cors({
  origin: 'https://aida-ng.herokuapp.com',
  credentials: true
}));


// my custom routes
require('./src/routes')(app);

auth.basic = auth.basic || ((req, res, next) => next())


app.get('/', function (req, res) {
  res.sendFile(`${path}/index.html`)
});



// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
// const  listener = app.listen(8000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

