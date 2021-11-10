const express = require("express");
const router = express.Router();
const sql = require("mssql");

router.get("/", function (req, res, next) {
  // Get the product name to search for
  let pool,
    productQuery,
    productResults,
    categoryNameQuery,
    categoryNameResults;

  let urlProductName = req.query.productName;
  let urlCategory = req.query.category;

  if (urlCategory === "All") {
    urlCategory = undefined;
  }

  console.log("Name >>>", urlProductName);
  console.log("Category >>>", urlCategory);
  /** $name now contains the search string the user entered
     Use it to build a query and print out the results. **/

  /** 
    For each product create a link of the form
    addcart?id=<productId>&name=<productName>&price=<productPrice>
    **/

  /**
        Useful code for formatting currency:
        let num = 2.89999;
        num = num.toFixed(2);
    **/

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
      productResults.recordset.forEach((dictItem) => {
        let urlString = `addcart?id=${dictItem.productId}&name=${
          dictItem.productName
        }&price=${dictItem.price.replace("$", "")}`;
        dictItem["url"] = urlString;
      });

      //   console.log(productResults);
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
