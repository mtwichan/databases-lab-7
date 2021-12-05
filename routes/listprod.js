const express = require("express");
const router = express.Router();
const sql = require("mssql");

router.get("/", function (req, res, next) {
  // Get the product name to search for
  let pool,
    productQuery,
    productResults,
    categoryNameQuery,
    categoryNameResults,
    urlProductName,
    urlCategory;

  urlProductName = req.query.productName;
  urlCategory = req.query.category;

  if (urlCategory === "All") {
    urlCategory = undefined;
  }

  // Queries
  productQuery =
    "SELECT p.productName, c.categoryName, FORMAT(p.productPrice, 'c') AS price, p.productId FROM product as p JOIN category as c ON p.categoryId = c.categoryId WHERE (@urlCategory is NULL OR c.categoryName = @urlCategory) AND (@urlProductName is NULL OR p.productName LIKE '%' + @urlProductName + '%')";
  categoryNameQuery = "SELECT DISTINCT c.categoryName FROM category as c";

  // Query and generate tables
  (async function () {
    try {
      /** Create connection, and validate that it connected successfully **/
      // Start SQL pool
      /** Create and validate connection **/
      pool = await sql.connect(dbConfig);
      productResults = await pool
        .request()
        .input("urlCategory", urlCategory)
        .input("urlProductName", urlProductName)
        .query(productQuery);
      categoryNameResults = await pool.request().query(categoryNameQuery);
      // Add all to dropdown selections
      categoryNameResults.recordset.unshift({ categoryName: "All" });

      /** Print out the ResultSet **/
      // Add URL string
      let urlAddCart, urlProduct;
      productResults.recordset.forEach((productRow) => {
        urlAddCart = `addcart?id=${productRow.productId}&name=${
          productRow.productName
        }&price=${productRow.price.replace("$", "")}`;
        urlProduct = `product?productId=${productRow.productId}`;

        productRow["urlAddCart"] = urlAddCart;
        productRow["urlProduct"] = urlProduct;
      });

      res.render("listprod", {
        title: "Ray's Grocery",
        categoryNames: categoryNameResults,
        productData: productResults,
      });
    } catch (err) {
      console.dir(err);
      res.write(err);
      res.end();
    }
  })();
});

module.exports = router;
