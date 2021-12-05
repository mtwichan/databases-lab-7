const express = require("express");
const router = express.Router();
const auth = require("../auth");
const sql = require("mssql");

router.post("/", function (req, res) {
  // Have to preserve async context since we make an async call
  // to the database in the validateLogin function.
  (async () => {
    let authenticatedUser = await validateLogin(req);
    if (authenticatedUser) {
      req.session.loginMessage = true;
      req.session.username = authenticatedUser;
      req.session.authenticatedUser = true;
      res.redirect("/");
    } else {
      res.redirect("/login");
    }
  })();
});

async function validateLogin(req) {
  if (!req.body || !req.body.username || !req.body.password) {
    return false;
  }

  let username = req.body.username;
  let password = req.body.password;
  let isAuthenticated = false;
  let loginAuthQuery =
    "SELECT userid, password FROM customer WHERE userid = @userid AND password = @password";
  let loginAuthResult = null;

  let authenticatedUser = await (async function () {
    try {
      let pool = await sql.connect(dbConfig);

      // TODO: Check if userId and password match some customer account.
      // If so, set authenticatedUser to be the username.
      loginAuthResult = await pool
        .request()
        .input("userId", sql.NText, username)
        .input("password", sql.NText, password)
        .query(loginAuthQuery);
    
      if (loginAuthResult.recordset.length !== 0) {
         loginAuthResult = loginAuthResult.recordset[0];
         if ((loginAuthResult["userid"] === username) && (loginAuthResult["password"] === password)) {
             isAuthenticated = true;
         }
      }

      return username;
    } catch (err) {
      console.dir(err);
      return false;
    }
  })();

  return authenticatedUser;
}

module.exports = router;
