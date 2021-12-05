const express = require("express");
const router = express.Router();
const sql = require("mssql");
const moment = require("moment");

router.get("/", function (req, res, next) {
  let pool,
    osQuery,
    osQueryResults,
    osQueryRecord,
    opQuery,
    opQueryResults;
  
  // Queries
  osQuery =
      "SELECT os.orderId, os.orderDate, c.customerId, c.firstName + ' ' + c.lastName AS customerName, os.totalAmount FROM ordersummary as os JOIN customer as c ON os.customerId = c.customerId ORDER BY orderId ASC";
  opQuery =
    "SELECT op.productId, op.quantity, FORMAT(op.price, 'c') as price, op.orderId FROM orderproduct as op WHERE op.orderId = @orderId";

  // Query and generate tables
  (async function () {
    let i;
    const orderData = [];
    try {
      /** Create connection, and validate that it connected successfully **/
      // Start SQL pool
      pool = await sql.connect(dbConfig);
      osQueryResults = await pool
        .request()
        .query(osQuery);

      /** Write query to retrieve all order headers **/
      /** For each order in the results
        Print out the order header information
        Write a query to retrieve the products in the order

        For each product in the order
            Write out product information 
    **/

      // Query and parse ordersummary table
      for (i = 0; i < osQueryResults.recordset.length; i++) {
        let orderMetaData = {};
        osQueryRecord = osQueryResults.recordset[i];
        // Format order date
        osQueryRecord.orderDate = moment(osQueryRecord.orderDate).format(
          "YYYY-MM-DD hh:mm:ss"
        );

        // Query orderproduct table
        opQueryResults = await pool
          .request()
          .input("orderId", sql.Int, osQueryRecord.orderId)
          .query(opQuery);

        orderMetaData["orderProduct"] = opQueryResults;
        orderMetaData["orderSummary"] = osQueryRecord;
        orderData.push(orderMetaData);
      }

      res.render("listorder", {
        title: "BankRank Grocery Order List",
        orderData: orderData,
      });
    } catch (err) {
      console.dir(err);
      res.write(err);
      res.end();
    }
  })();
});

module.exports = router;
