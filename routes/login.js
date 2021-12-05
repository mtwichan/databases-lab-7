const express = require("express")
const router = express.Router()

router.get("/", function (req, res, next) {
  // Set the message for the login, if present
  req.session.user = null
  req.session.username = null
  req.session.authenticatedUser = false
  let loginMessage = false
  if (req.session.loginMessage) {
    loginMessage = req.session.loginMessage
    req.session.loginMessage = null
  }

  res.render("login", {
    title: "Login Screen",
    loginMessage: loginMessage
  })
})

module.exports = router
