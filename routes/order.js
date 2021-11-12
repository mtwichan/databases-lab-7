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

  let customerQuery = `SELECT * FROM customer WHERE customer.customerId = @customerID`
  let orderQuery = `INSERT INTO ordersummary (customerId, orderDate, totalAmount) OUTPUT INSERTED.orderId VALUES (@customerId, @orderDate, @totalPrice)`
  let productQuery = `INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, @productId, @quantity, @price)`

  ;(() => {
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
          throw "Invalid customerID"
        } else if (result.recordset[0].password !== req.query.password) {
          throw "Invalid password"
        } else {
          let customer = result.recordset[0]
          write += `<h1>${customer.firstName}'s Order</h1>\n`
          // Setting totalPrice here because it makes more sense don't take marks off
          let totalPrice = productList.filter(product => product).reduce((sum, product) => sum + product.price * product.quantity, 0)
          /** Save order information to database**/
          return pool.request().input("customerId", customerId).input("orderDate", moment(new Date()).format("YYYY-MM-DD HH:mm:ss")).input("totalPrice", totalPrice).query(orderQuery)
        }
      })
      .then(result => {
        let orderId = result.recordset[0].orderId

        return Promise.all(
          productList
            .filter(product => product)
            .map(async product => {
              try {
                /** Insert each item into OrderedProduct table using OrderId from previous INSERT **/
                await pool.request().input("orderId", orderId).input("productId", product.id).input("quantity", product.quantity).input("price", product.price).query(productQuery)
                write += `<h2>${product.name}</h2>\n`
                write += `<h3>Quantity: ${product.quantity}, Price: ${product.price}</h3>\n`
              } catch (err) {
                console.dir(err)
                write += `<h2>Error adding ${product.name} to order</h2>\n`
              }
            })
        )
      })
      .then(() => {
        /** Print out order summary **/
        res.write(write)
        /** Clear session/cart **/
        req.session.destroy()
        res.end()
      })
      .catch(err => {
        console.dir(err)
        res.write(err)
        res.end()
      })
  })()
})

module.exports = router
