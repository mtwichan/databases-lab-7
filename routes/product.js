const express = require("express")
const router = express.Router()
const sql = require("mssql")
const moment = require("moment")

const sendData = (req, res, next, error) => {
  let pool, productQuery, productQueryResults, productRow, urlProductImgBinary, urlAddCart, urlProductId
  ;(async function () {
    try {
      productQuery = "SELECT p.productId, FORMAT(p.productPrice, 'c') AS price, p.productName, p.productImageURL, p.productDesc " + "FROM product AS p " + "WHERE p.productId = @productId"
      urlProductId = req.query.productId
      pool = await sql.connect(dbConfig)

      // Get product name to search for
      // TODO: Retrieve and display info for the product
      productQueryResults = await pool.request().input("productId", sql.Int, urlProductId).query(productQuery)
      productRow = productQueryResults.recordset[0]

      // TODO: If there is a productImageURL, display using IMG tag
      // TODO: Add links to Add to Cart and Continue Shopping
      // TODO: Retrieve any image stored directly in database. Note: Call displayImage.jsp with product id as parameter.
      urlProductImgBinary = `displayImage?productId=${productRow.productId}`
      urlAddCart = `addcart?id=${productRow.productId}&name=${productRow.productName}&price=${productRow.price.replace("$", "")}`

      res.render("product", {
        title: "Ray's Grocery",
        urlProductImg: productRow.productImageURL,
        urlProductImgBinary: urlProductImgBinary,
        auth: req.session.user ? true : false,
        error: error ? error : null,
        productId: productRow.productId,
        productPrice: productRow.price,
        urlAddCart: urlAddCart,
        productDesc: productRow.productDesc
      })
    } catch (err) {
      console.dir(err)
      res.write(err + "")
      res.end()
    }
  })()
}

router.get("/", (req, res, next) => {
  sendData(req, res, next)
})

router.post("/", async (req, res) => {
  let {review, rating} = req.body
  let urlProductId = req.query.productId
  let pool = await sql.connect(dbConfig)
  let error
  try {
    await pool.request().input("productId", urlProductId).input("customerId", req.session.user.costumerId).input("review", review).input("rating", rating).input("date", moment(new Date()).format("YYYY-MM-DD HH:mm:ss")).query("INSERT INTO review (reviewRating, reviewDate, customerId, productId, reviewComment) VALUES (@rating, @date, @customerId, @productId, @review);")
  } catch (err) {
    console.error(err)
    error = "Error creating review"
  }
  sendData(req, res, null, error)
})

module.exports = router
