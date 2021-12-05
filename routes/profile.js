const express = require("express")
const router = express.Router()
const sql = require("mssql")

router.get("/", (req, res) => {
  if (!req.session.authenticatedUser) {
    res.redirect("/login")
  } else {
    res.render("profile", {
      title: "Profile",
      user: req.session.user
    })
  }
})

router.post("/", async (req, res) => {
  console.log("post")
  let {userid, password, firstName, lastName, email, phonenum, address, city, state, postalCode, country} = req.body,
    error = null
  let query = "UPDATE customer SET ",
    updates = [],
    newUser = {...req.session.user}
  for (const [key, value] of Object.entries(req.body)) {
    if (req.session.user[key] != value) {
      newUser[key] = value
      updates.push(`${key} = '${value}'`)
    }
  }
  if (updates.length === 0) {
    res.render("profile", {
      title: "Profile",
      message: "Nothing to update"
    })
  }
  query += updates.join(", ") + " WHERE userid = @username;"
  console.log(query)
  if (firstName.length > 40) error = "First name too long"
  else if (lastName.length > 40) error = "Last name too long"
  else if (email.length > 50) error = "Email too long"
  else if (phonenum.length > 20) error = "Phone number too long"
  else if (address.length > 50) error = "Address too long"
  else if (city.length > 40) error = "City too long"
  else if (state.length > 20) error = "State too long"
  else if (postalCode.length > 20) error = "Postal code too long"
  else if (country.length > 40) error = "Country too long"
  else if (userid.length > 20) error = "Username too long"
  else if (userid.trim().length < 3) error = "Username too short"
  else if (password.length > 30) error = "I demand you pick a shorter password"
  else if (password.trim().length < 3) error = "Password too short"
  else {
    let pool = await sql.connect(dbConfig)
    await pool.request().input("username", userid).query(query)
    req.session.username = newUser.userid
    req.session.user = newUser
    res.render("profile", {
      title: "Profile",
      message: "Successfully updated user",
      user: req.session.user
    })
  }
  res.render("profile", {
    title: "Profile",
    error,
    user: req.session.user
  })
})

module.exports = router
