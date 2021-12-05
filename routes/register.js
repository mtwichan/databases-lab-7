const express = require("express")
const router = express.Router()
const sql = require("mssql")

router.get("/", (req, res) => {
  res.render("register", {
    title: "Register"
  })
})

router.post("/", async (req, res) => {
  let {username, password, firstname, lastname, email, phone, address, city, state, postalcode, country} = req.body,
    error = null
  if (firstname.length > 40) error = "First name too long"
  else if (lastname.length > 40) error = "Last name too long"
  else if (email.length > 50) error = "Email too long"
  else if (phone.length > 20) error = "Phone number too long"
  else if (address.length > 50) error = "Address too long"
  else if (city.length > 40) error = "City too long"
  else if (state.length > 20) error = "State too long"
  else if (postalcode.length > 20) error = "Postal code too long"
  else if (country.length > 40) error = "Country too long"
  else if (username.length > 20) error = "Username too long"
  else if (username.trim().length < 3) error = "Username too short"
  else if (password.length > 30) error = "I demand you pick a shorter password"
  else if (password.trim().length < 3) error = "Password too short"
  else {
    let pool = await sql.connect(dbConfig)
    let users = await pool.request().input("userId", sql.NText, username).query("SELECT userid FROM customer WHERE userid = @userid")
    if (users.recordset.length === 0) {
      await pool
        .request()
        .input("firstname", firstname)
        .input("lastname", lastname)
        .input("email", email)
        .input("phone", phone)
        .input("address", address)
        .input("city", city)
        .input("state", state)
        .input("postalcode", postalcode)
        .input("country", country)
        .input("username", username)
        .input("password", password)
        .query("INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) values (@firstname, @lastname, @email, @phone, @address, @city, @state, @postalcode, @country, @username, @password)")
      req.session.loginMessage = "Your account has been created, you may now login."
      res.redirect("/login")
    } else error = "Username has already been taken"
  }
  res.render("register", {
    title: "Register",
    error
  })
})

module.exports = router
