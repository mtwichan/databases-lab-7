const express = require("express");
const router = express.Router();
const sql = require("mssql");
const auth = require("../auth");

router.get("/", function (req, res, next) {
  // TODO: Print Customer information
  auth.checkAuthentication(req, res);
  let customerQuery = "SELECT * FROM customer WHERE userid = @userid";
  let username = req.session.username;
  let customerResult;
  (async function () {
    try {
      let pool = await sql.connect(dbConfig);
      customerResult = await pool.request().input("userid", sql.NText, username).query(customerQuery);
      customerResult = customerResult.recordset;

      res.render("customer", {
        title: "Customer Page",
        customerData: customerResult
      });
      // TODO: Print customer info
    } catch (err) {
      console.dir(err);
      res.end();
    }
  })();
});

module.exports = router;
