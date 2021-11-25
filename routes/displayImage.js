const express = require("express");
const router = express.Router();
const sql = require("mssql");

router.get("/", function (req, res, next) {
  res.setHeader("Content-Type", "image/jpeg");

  let id = req.query.productId;
  let idVal = parseInt(id);
  if (isNaN(idVal)) {
    res.end();
    return;
  }

  (async function () {
    try {
      let pool = await sql.connect(dbConfig);

      let sqlQuery =
        "SELECT p.productId, p.productImage " +
        "FROM product AS p " +
        "WHERE p.productId = @productId";

      result = await pool
        .request()
        .input("productId", sql.Int, idVal)
        .query(sqlQuery);

      if (result.recordset.length === 0) {
        console.log("No image record");
        res.end();
        return;
      } else {
        let productImage = result.recordset[0].productImage;
        res.write(productImage);
      }

      res.end();
    } catch (err) {
      console.dir(err);
      res.write(err + "");
      res.end();
    }
  })();
});

module.exports = router;
