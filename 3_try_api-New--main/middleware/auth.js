const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const rsa = require("node-rsa");
const fs = require("fs");

const privateKey = fs.readFileSync("./key/private.pem", "utf-8");
let key_private = new rsa(privateKey);

module.exports.isAuth = async (req, res, next) => {
  try {
    let token = req.headers["x-csrf"];

    // Check if the token exists first.
    if (!token) {
      return res.status(401).json({
        status: "Failed",
        message: "No token provided in 'x-csrf' header.",
      });
    }
    if(token!=PROCES)

    // Now it is safe to decrypt
    token = key_private.decrypt(token, "utf8");
    console.log("Decrypted Token -------------------> ",token);
    jwt.verify(token, process.env.JWT_SECRET_KEY, function (error, decode) {
      if (error) {
        return res.status(401).json({
          status: "Failed",
          message: "Invalid or expired token.",
        });
      }
      req.mail = decode.email;
      
      next(); 
    });

  } catch (err) {
    console.log("Auth Error:", err);
    return res.status(500).json({
      status: "Failed",
      error: "Auth Middleware crashed",
      message: err.toString(),
    });
  }
};