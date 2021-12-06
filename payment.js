const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
	let customerId = req.query.customerId;
	let pasword = req.query.password;
	res.setHeader("Content-Type", "text/html");
	res.write("<title>Grocery Payment </title>");

	res.write("<h1>Enter Payment Information: </h1>");

	res.write('<form method=get" action="checkout">');
	res.write("<h3>Enter a Payment method</h3>\n");
	res.write(
		'<select name="payment">' +
			'<option value="1">Debit</option>\n' +
			'<option value="2">Credit</option>\n' +
			'<option value="3">Paypal</option>\n' +
			"</select>\n"
	);
	res.write("<h3>Enter a Payment Number</h3>\n");
	res.write('<input type="number" name="number" size="50">\n');
	res.write("<h3>Enter an Expiry Date</h3>\n");
	res.write('<input type="text" name="date" size="50">\n');
	res.write("<br><br>");
	res.write('<input type="submit" value="Submit">\n');
	res.write("</form>");

	res.end();
});

module.exports = router;
