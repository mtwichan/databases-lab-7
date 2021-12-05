const express = require("express");
const router = express.Router();
const sql = require("mssql");
const moment = require("moment");

router.get("/", function (req, res, next) {
  let orderId, itemsQuery, quantityQuery;

  // TODO: Get order id
  orderId = req.query.orderId;

  // TODO: Check if valid order id
  // if (Number.isInteger(orderId) === false) {
  //   res.setHeader("Content-Type", "text/html");
  //   res.write("Query invalid");
  //   res.end();
  //   // return;
  // }

  itemsQuery =
    "SELECT p.productId FROM product p WHERE p.productId IN (SELECT op.productId FROM orderproduct AS op WHERE orderId = @orderId)";
  quantityQuery =
    "SELECT op.orderId, op.productId, op.quantity AS orderQuantity, pinv.quantity AS productQuantity FROM orderproduct op JOIN productinventory pinv ON op.productId = pinv.productId WHERE op.orderId = @orderId AND pinv.warehouseId = @warehouseId AND pinv.productId IN (@productIdList)";

  (async function () {
    try {
      let pool = await sql.connect(dbConfig);
      const transaction = pool.transaction();
      const request = transaction
        .request()
        .input("orderId", sql.Int, orderId)
        .input("warehouseId", sql.Int, 1);

      // TODO: Retrieve all items in order with given id
      let itemResult = await pool
        .request()
        .input("orderId", sql.Int, orderId)
        .query(itemsQuery);
      let itemProductIds = [];
      itemResult.recordset.forEach((ele) => {
        itemProductIds.push(ele.productId);
      });

      let quantityResult = await pool
        .request()
        .input("productIdList", 1)
        .input("orderId", sql.Int, orderId)
        .input("warehouseId", sql.Int, 1)
        .query(quantityQuery);

      console.log("quantityResult >>>", quantityResult);

      // console.log(itemProductIds);
      // // TODO: Start a transaction
      // // Transaction 1:
      transaction.begin((err) => {
        let rolledBack = false;
        transaction.on("rollback", (aborted) => {
          console.log("rollback triggered >>>");
          rolledBack = true;
        });

        let m = new Date();
        let dateString =
          m.getUTCFullYear() +
          "-" +
          (m.getUTCMonth() + 1) +
          "-" +
          m.getUTCDate();
        request.query(
          `INSERT INTO shipment (shipmentDate, shipmentDesc, warehouseId) VALUES ('${dateString}', 'shipment', 1)`,
          (err, results) => {
            if (err) {
              if (!rolledBack) {
                transaction.rollback((err) => {
                  // ... error checks                  
                  console.log("rollback fired transcation 1 >>>", err);
                });
              }
            } else {
              transaction.commit((_) => {
                // ... error checks
                console.log("commit fired transcation 1 >>>");
              });
            }
          }
        );
      });

      // Transaction 2: Am unable to run multiple queries inside a transcation albiet synchronously...
      // transaction.begin((err) => {
      //   let rolledBack = false;

      //   transaction.on("rollback", (aborted) => {
      //     console.log("rollback triggered >>>");
      //     rolledBack = true;
      //   });

      //   for (let ele of quantityResult.recordset) {
      //     if (ele.productQuantity < ele.orderQuantity) {
      //       rolledBack = true;
      //       break;
      //     }
      //      request.input("productQuantity", sql.Int, ele.productQuantity - ele.orderQuantity).input("productId", sql.Int, ele.productId).query("UPDATE productinventory SET quantity=@productQuantity WHERE productId=@productId");
      // };
      //     if (err) {
      //       if (!rolledBack) {
      //         transaction.rollback((err) => {
      //           // ... error checks
      //           console.log("rollback fired transcation 2 >>>", err);
      //         });
      //       }
      //     } else {
      //       transaction.commit((err) => {
      //         // ... error checks
      //         console.log("commit fired transcation 2 >>>");
      //       });
      //     }
      //   });

      res.render("ship", {
        title: "Ray's Grocery",
      });
    } catch (err) {
      console.dir(err);
      res.write(err + "");
      res.end();
    }
  })();
});

module.exports = router;
