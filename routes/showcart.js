const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    let productList = false;
    let pool;
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Your Shopping Cart</title>");
    res.write(
		"<script>function update(newid, newqty) {\n" +
			'   window.location="showcart?update=" +newid + "&newqty=" + newqty;\n' +
			"}</script>\n"
	);
    if (req.session.productList) {
        productList = req.session.productList;
        res.write('<form name="form1">\n');
		res.write("<h1>Your Shopping Cart</h1>");
		res.write(
			"<table><tr><th>Product Id</th><th>Product Name</th><th>Quantity</th>"
		);
		res.write("<th>Price</th><th>Subtotal</th></tr>");


        let total = 0;
        let deleteprod;
		let update, newqty;

        if (req.query.delete) {
			deleteprod = req.query.delete;
			for (let i = 0; i < productList.length; i++) {
				product = productList[i];
				if (!product) {
					continue;
				}
				console.log(product);
				if (product.id == deleteprod) {
					productList.splice(i, 1);
				}
			}
		}

        if (req.query.update && req.query.newqty) {
			update = req.query.update;
			newqty = req.query.newqty;
			for (let i = 0; i < productList.length; i++) {
				product = productList[i];
				if (!product) {
					continue;
				}
				if (product.id == update) {
					product.quantity = newqty;
				}
			}
		}

        for (let i = 0; i < productList.length; i++) {
			product = productList[i];
			if (!product) {
				continue;
			}

			res.write("<tr><td>" + product.id + "</td>");
			res.write("<td>" + product.name + "</td>");

			res.write(
				'<td align="center"><input type="text" name="newqty' +
					product.id +
					'" size="3" value="' +
					Number(product.quantity) +
					'"></td>'
			);
			res.write(
				'<td align="right">$' + Number(product.price).toFixed(2) + "</td>"
			);
			res.write(
				'<td align="right">$' +
					(Number(product.quantity) * Number(product.price)).toFixed(2) +
					"</td>"
			);
			res.write(
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;<a href="showcart?delete=' +
					product.id +
					'">Remove Item from Cart</a></td>'
			);

			res.write(
				'<td>\n&nbsp;&nbsp;&nbsp;&nbsp;\n<input type="button" onclick="update(' +
					product.id +
					", " +
					"document.form1.newqty" +
					product.id +
					'.value)" value="Update Quantity">\n</td>\n'
			);
			res.write("</tr>\n\n");
			total = total + product.quantity * product.price;
		}
        res.write("<tr><td colspan=\"4\" align=\"right\"><b>Order Total</b></td><td align=\"right\">$" + total.toFixed(2) + "</td></tr>");
        res.write("</table>");

        res.write("<h2><a href=\"checkout\">Check Out</a></h2>");
    } else{
        res.write("<h1>Your shopping cart is empty!</h1>");
    }
    res.write('<h2><a href="listprod">Continue Shopping</a></h2>');
    res.write("</form>");
    res.end();
});

module.exports = router;
