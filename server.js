const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const bodyParser = require("body-parser");

let index = require("./routes/index");
let loadData = require("./routes/loaddata");
let listOrder = require("./routes/listorder");
let listProd = require("./routes/listprod");
let addCart = require("./routes/addcart");
let showCart = require("./routes/showcart");
let checkout = require("./routes/checkout");
let payment = require("./routes/payment");
let order = require("./routes/order");
let login = require("./routes/login");
let validateLogin = require("./routes/validateLogin");
let logout = require("./routes/logout");
let admin = require("./routes/admin");
let product = require("./routes/product");
let displayImage = require("./routes/displayImage");
let customer = require("./routes/customer");
let ship = require("./routes/ship");
let warehouse = require("./routes/warehouse");
const register = require("./routes/register");
const profile = require("./routes/profile");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// This DB Config is accessible globally
dbConfig = {
	user: "SA",
	password: "YourStrong@Passw0rd",
	server: "db",
	database: "tempdb",
	options: {
		enableArithAbort: true,
		encrypt: false,
	},
};

// Setting up the session.
// This uses MemoryStorage which is not
// recommended for production use.
app.use(
	session({
		secret: "COSC 304 Rules!",
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: false,
			secure: false,
			maxAge: 60000,
		},
	})
);

// const hbs = exphbs.create(
//   {
//     defaultLayout: 'main',
//     layoutsDir: path.join(__dirname, 'views/layouts'),
//     partialsDir: path.join(__dirname, 'views/partials')
//   }
// )

// Setting up the rendering engine
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

// Setting up where static assets should
// be served from.
app.use(express.static(__dirname + "/public"));

// Setting up Express.js routes.
// These present a "route" on the URL of the site.
// Eg: http://127.0.0.1/loaddata
app.use("/", index);
app.use("/loaddata", loadData);
app.use("/listorder", listOrder);
app.use("/listprod", listProd);
app.use("/addcart", addCart);
app.use("/showcart", showCart);
app.use("/checkout", checkout);
app.use("/payment", payment);
app.use("/order", order);
app.use("/login", login);
app.use("/validateLogin", validateLogin);
app.use("/logout", logout);
app.use("/admin", admin);
app.use("/product", product);
app.use("/displayImage", displayImage);
app.use("/customer", customer);
app.use("/ship", ship);
app.use("/register", register);
app.use("/profile", profile);
app.use("/warehouse",warehouse);

// Starting our Express app
app.listen(3000);
