const express = require("express")
const router = express.Router()
const auth = require("../auth")
const sql = require("mssql")
const fs = require("fs")
const moment = require("moment")

const writePage = async (req, res) => {
  auth.checkAuthentication(req, res)
  let totalSalesQuery = "SELECT CAST(orderDate AS DATE) AS orderDate, SUM(totalAmount) AS totalAmount FROM ordersummary o GROUP BY CAST(orderDate AS DATE)"
  let customerQuery = "SELECT customerId, firstName, lastName FROM customer"
  let totalSalesResult
  let customerResult
  try {
    let pool = await sql.connect(dbConfig)

    // TODO: Write SQL query that prints out total order amount by day
    totalSalesResult = await pool.request().query(totalSalesQuery)
    totalSalesResult = totalSalesResult.recordset
    totalSalesResult.forEach(element => {
      element.orderDate = moment(element.orderDate).format("YYYY-MM-DD hh:mm:ss")
    })

    customerResult = await pool.request().query(customerQuery)
    customerResult = customerResult.recordset

    res.render("administrator", {
      title: "Administrator Page",
      totalSalesData: totalSalesResult,
      customersData: customerResult
    })
  } catch (err) {
    console.dir(err)
    res.write(err + "")
    res.end()
  }
}

router.get("/", function (req, res, next) {
  // TODO: Include files auth.jsp and jdbc.jsp
  writePage(req, res)
})

router.post("/", async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig)

    let data = fs.readFileSync("./data/data.ddl", {encoding: "utf8"})
    let commands = data.split(";")
    for (let i = 0; i < commands.length; i++) {
      let command = commands[i]
      await pool.request().query(command)
    }

    writePage(req, res)
  } catch (err) {
    console.dir(err)
    res.send(err)
  }
})

module.exports = router
