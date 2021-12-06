const express = require("express")
const router = express.Router()
const auth = require("../auth")
const sql = require("mssql")

router.get("/", function (req, res, next) {
   
    auth.checkAuthentication(req, res);
  
    let warehouseQuery = "SELECT warehouseId, productId, quantity FROM productinventory ORDER BY warehouseId ASC, productId ASC ";

    (async function () {
      try {
     
        let pool = await sql.connect(dbConfig);
        warehouseResult = await pool.request().query(warehouseQuery);
        warehouseResult = warehouseResult.recordset;

        res.render("warehouse", {
          title: "Warehouse Page",
          warehouseData: warehouseResult,
   
        });
        
      } catch (err) {
        console.dir(err);
        res.end();
      }
    })();
});

module.exports = router