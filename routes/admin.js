const express = require("express");
const router = express.Router();
const auth = require("../auth");
const sql = require("mssql");
const moment = require("moment");

router.get("/", function (req, res, next) {
  // TODO: Include files auth.jsp and jdbc.jsp
  auth.checkAuthentication(req, res);
  let totalSalesQuery = "SELECT CAST(orderDate AS DATE) AS orderDate, SUM(totalAmount) AS totalAmount FROM ordersummary o GROUP BY CAST(orderDate AS DATE)";
  let customerQuery = "SELECT customerId, firstName, lastName FROM customer";
  let totalSalesResult;
  let customerResult;

  (async function () {
    try {
      let pool = await sql.connect(dbConfig);

      // TODO: Write SQL query that prints out total order amount by day
      totalSalesResult = await pool.request().query(totalSalesQuery);
      totalSalesResult = totalSalesResult.recordset;
      totalSalesResult.forEach(element => {
        element.orderDate = moment(element.orderDate).format(
          "YYYY-MM-DD hh:mm:ss"
        )
      });

      customerResult = await pool.request().query(customerQuery);
      customerResult = customerResult.recordset;

      res.render("administrator", {
        title: "Administrator Page",
        totalSalesData: totalSalesResult,
        customersData: customerResult
      })
    } catch (err) {
      console.dir(err);
      res.write(err + "");
      res.end();
    }
  })();
});

module.exports = router;
