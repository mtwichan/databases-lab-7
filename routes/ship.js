const express = require("express");
const router = express.Router();
const sql = require("mssql");
const moment = require("moment");

router.get("/", function (req, res, next) {
  let orderId, itemsQuery, quantityQuery, pool, transaction, itemList, write = ''

  res.setHeader("Content-Type", "text/html")
  res.write("<title>YOUR NAME Grocery Order Processing</title>")
  // TODO: Get order id
  orderId = req.query.orderId;

  itemsQuery =
    "SELECT p.productId FROM product p WHERE p.productId IN (SELECT op.productId FROM orderproduct AS op WHERE orderId = @orderId)";
  quantityQuery =
    "SELECT op.orderId, op.productId, op.quantity AS orderQuantity, pinv.quantity AS productQuantity FROM orderproduct op JOIN productinventory pinv ON op.productId = pinv.productId WHERE op.orderId = @orderId AND pinv.warehouseId = @warehouseId";

  let shipmentInsert = "INSERT INTO shipment (shipmentDate, shipmentDesc, warehouseId) values (@shipmentDate, @shipmentDesc, @warehouseId);"
  let quantityUpdate = "update productinventory set quantity = @newquantity where productid = @pid;"

    sql.connect(dbConfig).then(p => {
      pool = p
      transaction = pool.transaction()
      return pool.request().input("orderId", orderId).query(itemsQuery)
    }).then(({recordset}) => {
      itemList = recordset
      return pool.request().input("orderId", orderId).input('warehouseId', 1).query(quantityQuery)
    }).then((q) => {
      let recordset = q.recordset
      console.log(q)
      recordset.forEach((quantity,idx) => {
        if(quantity.orderQuantity > quantity.productQuantity){
          throw `Shipment not done. Insufficient inventory for product id: ${item.productId}`
        }
        itemList[idx].orderQuantity = quantity.orderQuantity
        itemList[idx].productQuantity = quantity.productQuantity
        write+=`<p>Ordered product: ${itemList[idx].productId} Qty: ${itemList[idx].orderQuantity} Previous inventory: ${itemList[idx].productQuantity} New inventory: ${itemList[idx].productQuantity - itemList[idx].orderQuantity}</p>\n`
      })
      return pool.request().input('shipmentDate', moment(new Date()).format("YYYY-MM-DD HH:mm:ss")).input('shipmentDesc', `The shipment for order ${orderId}`).input("warehouseId", 1).query(shipmentInsert)
    }).then(() => {
      transaction.begin(async err => {
        let request = new sql.Request(transaction)
        if(err){
          throw err
        }
        let rolledBack = false
        itemList.forEach(async (item) => {
          if(!rolledBack){
            await new Promise(resolve => {
              request.query(`update orderproduct set quantity = ${item.productQuantity - item.orderQuantity} where productid = ${item.productId};`, (err, result => {
                if(err){
                  rolledBack = err 
                }
                resolve()
              }))
            })
          }
        })

        if(!rolledBack){
          write+="<h4>Shipment successfully processed.</h4>\n"
          transaction.commit(err => {
            if(err) throw err
            res.write(write)
            res.end()
          })
        } else {
          transaction.rollback()
          throw rolledBack
        }

      })
    }).catch(err => {
      console.error(err)
      res.write(err)
      res.end()
    })

});

module.exports = router;
