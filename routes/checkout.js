const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
	res.setHeader("Content-Type", "text/html");
	if (req.query.payment && req.query.date) {
		res.write("<title>Grocery CheckOut Line</title>");

		res.write("<h1>Enter your customer id to complete the transaction:</h1>");

		res.write('<form method="get" action="order">');
		res.write(
			'<input type="text" name="customerId" placeHolder="ID" size="50">\n'
		);
		res.write(
			'<input type="text" name="password" placeHolder="Password" size="50">\n'
		);
		res.write(
			'<input type="submit" value="Submit"><input type="reset" value="Reset">\n'
		);
		res.write("</form>");

		res.end();
	} else {
		res.write("<h1>The Payment Info is incorrect, please try again.");
		res.end();
	}
});

module.exports = router;
