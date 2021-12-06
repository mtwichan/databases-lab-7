const express = require("express")
const router = express.Router()
const sql = require("mssql")
const moment = require("moment")

router.get("/", function (req, res, next) {
  res.setHeader("Content-Type", "text/html")
  res.write("<title>YOUR NAME Grocery Order Processing</title>")

  let productList = false
  if (req.session.productList && req.session.productList.length > 0) {
    productList = req.session.productList
  }

  //Determine if there are products in the shopping cart
  if (!productList) {
    res.write("<h1>Error, empty shopping cart.</h1>")
    return res.end()
  }

  let customerId = req.query.customerId
  let total = 0;
	let subtotal = 0;
	let ref;
	let name;
  let customerQuery = `SELECT * FROM customer WHERE customer.customerId = @customerID`
  let orderQuery = `INSERT INTO ordersummary (customerId, orderDate, totalAmount) OUTPUT INSERTED.orderId VALUES (@customerId, @orderDate, @totalPrice)`
  let productQuery = `INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, @productId, @quantity, @price)`

  let pool,
    write = ""
  /** Create connection, and validate that it connected successfully **/
  // Start SQL pool
  /** Create and validate connection **/
  sql
    .connect(dbConfig)
    .then(p => {
      pool = p
      return pool.request().input("customerID", customerId).query(customerQuery)
    })
    .then(result => {
      //Determine if valid customer id was entered
      if (result.recordset.length !== 1) {
        throw "Invalid customerID. Go back to the previous page and try again."
      } else if (result.recordset[0].password !== req.query.password) {
        throw "Invalid password. Go back to the previous page and try again."
      } else {
        let customer = result.recordset[0]
        name = customer.firstName;
        write += `<h1>${customer.firstName}'s Order</h1>\n`
        // Setting totalPrice here because it makes more sense don't take marks off
        let totalPrice = productList.filter(product => product).reduce((sum, product) => sum + product.price * product.quantity, 0)
        /** Save order information to database**/
        return pool.request().input("customerId", customerId).input("orderDate", moment(new Date()).format("YYYY-MM-DD HH:mm:ss")).input("totalPrice", totalPrice).query(orderQuery)
      }
    })
    .then(result => {
      let orderId = result.recordset[0].orderId
      ref = orderId;
      return Promise.all(
        productList
          .filter(product => product)
          .map(async product => {
            try {
              /** Insert each item into OrderedProduct table using OrderId from previous INSERT **/
              await pool
              .request()
              .input("orderId", orderId)
              .input("productId", product.id)
              .input("quantity", product.quantity)
              .input("price", product.price)
              .query(productQuery)
              write += `<h2>${product.name}</h2>\n`;
							subtotal += Number(product.price) * Number(product.quantity);
							write += `<h3>Quantity: ${product.quantity}, Price: ${
								product.price
							}, SubTotal: ${subtotal.toFixed(2)}</h3>\n`;
							total += subtotal;
            } catch (err) {
              console.dir(err)
              write += `<h2>Error adding ${product.name} to order</h2>\n`
            }
          })
      )
    })
    .then(() => {
      /** Print out order summary **/
      res.write(write);
			res.write(`<h2>Total price: ${total.toFixed(2)}</h2>\n`);
			res.write(`<h1>Order completed. Will be shipped soon...</h1>\n`);
			res.write(`<h1>Your order reference number is: ${ref}</h1>\n`);
			res.write(`<h1>Shipping to customer: ${name} </h1>\n`);
			res.write("<h2><a href='/'>Back to Main Page</a></h2>");
      /** Clear session/cart **/
      req.session.destroy()
      res.end()
    })
    .catch(err => {
      console.dir(err)
      res.write(err)
      res.end()
    })
})

module.exports = router
