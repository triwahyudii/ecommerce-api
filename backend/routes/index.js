const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const con = require("../conn/conn");

router.get("/", function (req, res, next) {
  if (req.session.flag === 1) {
    req.session.destroy();
    res.render("index", {
      title: "TRI Store",
      message: "Email Already Exists",
      flag: 1,
    });
  } else if (req.session.flag === 2) {
    req.session.destroy();
    res.render("index", {
      title: "TRI Store",
      message: "Registration Done. Please Login.",
      flag: 0,
    });
  } else if (req.session.flag === 3) {
    req.session.destroy();
    res.render("index", {
      title: "TRI Store",
      message: "Confirm Password Does Not Match.",
      flag: 1,
    });
  } else if (req.session.flag === 4) {
    req.session.destroy();
    res.render("index", {
      title: "TRI Store",
      message: "Incorrect Email or Password.",
      flag: 1,
    });
  } else {
    res.render("index", { title: "TRI Store" });
  }
});

router.post("/auth_reg", function (req, res, next) {
  const fullname = req.body.fullname;
  const email = req.body.email;
  const password = req.body.password;
  const cpassword = req.body.cpassword;

  if (cpassword === password) {
    const sql = "select * from user where email = ?;";

    con.query(sql, [email], function (err, result, fields) {
      if (err) throw err;

      if (result.length > 0) {
        req.session.flag = 1;
        res.redirect("/");
      } else {
        const hashpassword = bcrypt.hashSync(password, 10);
        const sql = "insert into user(fullname,email,password) values(?,?,?);";

        con.query(
          sql,
          [fullname, email, hashpassword],
          function (err, result, fields) {
            if (err) throw err;
            req.session.flag = 2;
            res.redirect("/");
          }
        );
      }
    });
  } else {
    req.session.flag = 3;
    res.redirect("/");
  }
});

router.post("/auth_login", function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  const sql = "select * from user where email = ?;";

  con.query(sql, [email], function (err, result, fields) {
    if (err) throw err;

    if (result.length && bcrypt.compareSync(password, result[0].password)) {
      req.session.email = email;
      res.redirect("/home");
    } else {
      req.session.flag = 4;
      res.redirect("/");
    }
  });
});

router.get("/home", function (req, res, next) {
  res.render("home", { message: "Welcome, " + req.session.email });
});

router.get("/logout", function (req, res, next) {
  if (req.session.email) {
    req.session.destroy();
    res.redirect("/");
  }
});

module.exports = router;
