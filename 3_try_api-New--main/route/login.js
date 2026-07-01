const express = require("express");
const router = express.Router();
const Validator = require("validatorjs");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const { QueryTypes } = require("sequelize");
const db = require("../db/models/index").sequelize;
require("dotenv").config();

// ---------------------------------
// ROUTE 1: REGISTER SOUNDBOX 
// ---------------------------------
router.post("/signUp", async (req, res) => {
  try {
    const body = req.body;

    const validators = new Validator(body, {
      soundBox_imei: "required",
      info_status: "required",
      software_version: "required"
    });

    if (validators.fails()) {
      return res.status(400).json({
        success: false,
        message: "Missing required manufacturing data (IMEI, status, version).",
      });
    }

    // 1. Check if IMEI already exists
    const search = await db.query(
      "SELECT soundBox_imei FROM SoundBoxInfo WHERE soundBox_imei = :soundBox_imei", 
      {
        replacements: { soundBox_imei: body.soundBox_imei },
        type: QueryTypes.SELECT,
      }
    );

    if (search.length > 0) {
      console.log(`[TMS] Rejected: IMEI ${body.soundBox_imei} already exists.`);
      return res.status(409).json({
        status: "Failed",
        message: "SoundBox IMEI already exists in the database",
      });
    }

    // 2. Insert new Soundbox into DB
    await db.query(
      `INSERT INTO SoundBoxInfo(soundBox_imei, info_status, lang, software_version, date) 
       VALUES (:soundBox_IMEI, :info_status, :lang, :software_version, :date)`,
      {
        replacements: {
          soundBox_IMEI: body.soundBox_imei,
          info_status: body.info_status,
          lang: body.lang || "EN", // Default to English if not provided
          software_version: body.software_version,
          date: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
        },
        type: QueryTypes.INSERT,
      }
    );

    console.log(`[TMS] New Soundbox Registered: ${body.soundBox_imei}`);
    return res.status(201).json({
      status: "success",
      message: "Soundbox registered successfully",
    });

  } catch (err) {
    console.error("[TMS ERROR] SignUp Crashed:", err);
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
});


router.get("/test", (req, res) => {
  res.status(200).json({ message: "API is working!" });
});

// ---------------------------------------------------------
// ROUTE 2: HARDWARE LOGIN (Generates the VIP Pass)
// ---------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    // Note: Kept SN and deviceId in validation as requested, 
    // but we primarily use IMEI to identify the board.
    const { soundboximei, DeviceId, SN, imsi} = req.body;
    
    let validation = new Validator(req.body, {
      soundboximei: "required",
      DeviceId: "required",
      SN: "required", 
      imsi : "required" 
    });

    if (validation.fails()) {
      return res.status(400).json({ 
        success: false,
        message: "Sound box IMEI, deviceId and SN are required for Login",
      });
    }

    // 1. Fetch the Record from DB
    const queryResult = await db.query(
      `SELECT soundbox_imei, info_status, lang, software_version 
       FROM soundboxinfo 
       WHERE soundbox_imei = :soundboximei 
       AND "DeviceId" = :DeviceId 
       AND "SN" = :SN 
       AND "Imsi" = :imsi`,
      {
        replacements: { 
            soundboximei: soundboximei, 
            DeviceId: DeviceId, 
            SN: SN, 
            imsi: imsi 
        },
        type: QueryTypes.SELECT,
      }
    );

    // 2. Identity Verification
    if (!queryResult || queryResult.length === 0) {
      console.log(`[SECURITY] Failed login attempt for unknown IMEI: ${soundboximei}`);
      return res.status(404).json({
        status: "Failed",
        message: "Soundbox record not found in database",
      });
    }

    const userRecord = queryResult[0];

    // Note: Since IMEI is plain text, we just verify the DB found it. 
    // If you want tighter security later, hardware should send a secondary secret MAC key.

    // 3. Generate the EMQX Compatible JWT
    // The EMQX server is looking for the claim "clientId"
    const token = jwt.sign(
      { clientId: soundboximei }, 
      process.env.JWT_SECRET_KEY, // Ensure this matches EMQX exactly
      { expiresIn: "24h" }
    );

    console.log(`[TMS] Authentication Success. JWT issued for ${soundboximei}`);

    // 4. Clean, easily parsable JSON for the C code
    return res.status(200).json({
      status: "success",
      token: token,
      lang: userRecord.lang // Sending language back so the box knows which audio files to play
    });

  } catch (err) {
    console.error("[TMS ERROR] Login Route Crashed:", err);
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
});

module.exports = router;