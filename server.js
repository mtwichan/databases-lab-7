const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const path = require('path');

let loadData = require('./routes/loaddata');
let listOrder = require('./routes/listorder');
let listProd = require('./routes/listprod');
let addCart = require('./routes/addcart');
let showCart = require('./routes/showcart');
let checkout = require('./routes/checkout');
let order = require('./routes/order');

const app = express();

app.use(express.static(__dirname + '/public'));

// This DB Config is accessible globally
dbConfig = {
  user: 'SA',
  password: 'YourStrong@Passw0rd',
  server: 'db',
  database: 'tempdb',
  options: {
    'enableArithAbort': true,
    'encrypt': false,
  }
}

// Setting up the session.
// This uses MemoryStorage which is not
// recommended for production use.
app.use(session({
  secret: 'COSC 304 Rules!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    secure: false,
    maxAge: 60000,
  }
}))

// const hbs = exphbs.create(
//   {
//     defaultLayout: 'main',
//     layoutsDir: path.join(__dirname, 'views/layouts'),
//     partialsDir: path.join(__dirname, 'views/partials')
//   }
// )
// Setting up the rendering engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Setting up Express.js routes.
// These present a "route" on the URL of the site.
// Eg: http://127.0.0.1/loaddata
app.use('/loaddata', loadData);
app.use('/listorder', listOrder);
app.use('/listprod', listProd);
app.use('/addcart', addCart);
app.use('/showcart', showCart);
app.use('/checkout', checkout);
app.use('/order', order);

// Rendering the main page
app.get('/', function (req, res) {
  res.render('index', {
    title: "BankRank Shop Page"
  });
})

// Starting our Express app
app.listen(3000)