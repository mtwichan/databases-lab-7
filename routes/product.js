const express = require("express");
const router = express.Router();
const sql = require("mssql");
const rules = require("nodemon/lib/rules");

router.get("/", function (req, res, next) {
  let pool,
    productQuery,
    productQueryResults,
    productRow,
    urlProductImgBinary,
    urlAddCart,
    urlProductId;

  (async function () {
    try {
      productQuery =
        "SELECT p.productId, FORMAT(p.productPrice, 'c') AS price, p.productName, p.productImageURL " +
        "FROM product AS p " +
        "WHERE p.productId = @productId";
      urlProductId = req.query.productId;
      pool = await sql.connect(dbConfig);
      
      // Get product name to search for
      // TODO: Retrieve and display info for the product
      productQueryResults = await pool
        .request()
        .input("productId", sql.Int, urlProductId)
        .query(productQuery);
      productRow = productQueryResults.recordset[0];

      // TODO: If there is a productImageURL, display using IMG tag
      // TODO: Add links to Add to Cart and Continue Shopping
      // TODO: Retrieve any image stored directly in database. Note: Call displayImage.jsp with product id as parameter.
      urlProductImgBinary = `displayImage?productId=${productRow.productId}`;
      urlAddCart = `addcart?id=${productRow.productId}&name=${
        productRow.productName
      }&price=${productRow.price.replace("$", "")}`;

      
      res.render("product", {
        title: "Ray's Grocery",
        urlProductImg: productRow.productImageURL,
        urlProductImgBinary: urlProductImgBinary,
        productId: productRow.productId,
        productPrice: productRow.price,
        urlAddCart: urlAddCart,
      });
    } catch (err) {
      console.dir(err);
      res.write(err + "");
      res.end();
    }
  })();
});

module.exports = router;
