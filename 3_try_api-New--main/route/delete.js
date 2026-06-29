const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { isAuth } = require("../middleware/auth");
// const { db } = require("../config/db_js_database");
const db = require("../db/models/index").sequelize;
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt"); 

router.post("/delete", [isAuth], async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1: Find user by email
    const [user] = await db.query(
      "SELECT * FROM soundboxinfo WHERE soundboximei = :soundboximei",
      {
        replacements: { soundboximei: req.body.soundboximei },
        type: QueryTypes.SELECT,
      }
    );

    if (!user) {
      return res.status(404).json({
        status: "Failed",
        message: "Soundboximei not found or already deleted",
      });
    }

    // Step 2: Compare hashed passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "Failed",
        message: "Incorrect password",
      });
    }

    // Step 3: Delete the user
    const result = await db.query(
      "DELETE FROM soundboxinfo WHERE soundboximei = :soundboximei",
      {
        replacements: { soundboximei: req.body.soundboximei },
        type: QueryTypes.DELETE,
      }
    );
    console.log("<---------------------Delete result:", result, "--------------------->");
    return res.status(200).json({
      status: "Success",
      message: "IMEI has been deleted successfully",
    });
  } catch (error) {
    console.error("Caught error in /delete:", error);
    return res.status(500).json({
      status: "Failed",
      message: "Something went wrong during deletion",
    });
  }
});

module.exports = router;
