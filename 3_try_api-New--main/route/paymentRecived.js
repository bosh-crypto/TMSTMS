// const express = require("express");
// const router = express.Router();
// const jwt = require("jsonwebtoken");
// // const { isAuth } = require("../middleware/auth");
// // // const db = require("../db/models/index").sequelize;
// // const { QueryTypes } = require("sequelize");
// const mqtt = require("mqtt");

// // 1. FIXED: Added 'mqtts://' to the front of the URL
// const brokerUrl = 'mqtts://380a16c79bdb4eb39ead8a0c64f86e73.s1.eu.hivemq.cloud:8883';

// // 2. FIXED: Moved the connection OUTSIDE the route
// const options = {
//   // A static client ID is fine for a single backend server
//   clientId: 'node_server_soundbox_api', 
//   username: 'Gatik', // Put your HiveMQ username here
//   password: 'Test@1234', // Put your HiveMQ password here
//   rejectUnauthorized: true   
// };

// // Establish the connection ONCE when the server starts
// const client = mqtt.connect(brokerUrl, options);

// client.on('connect', () => {
//   console.log('Node.js connected securely to HiveMQ Cloud!');
// });

// client.on('error', (err) => {
//   console.error('HiveMQ Connection Error:', err);
// });


// // 3. The API Route (Only handles incoming payments and publishing)
// router.post("/paymentRecived",  async (req, res) => {
//   try {
//     // I am assuming you send an IMEI and an amount in your request body
//       const { soundbox_imei, amount } = req.body; 
//       // const queryResult = await db.query(
//       //   `SELECT id, soundBox_imei, info_status, lang, software_version, date FROM SoundBoxInfo WHERE soundBox_imei = :soundBox_imei`, // Select id too for token generation
//       //   {
//       //     replacements: { soundBox_imei: soundbox_imei },
//       //     type: QueryTypes.SELECT,
//       //   }
//       // );
  
//       // if ( !  queryResult ) {
//       //   return res.status(400).json({
//       //     status: "Failed",
//       //     messgae: "IMEI number not found ",
//       //   });
//       // }else{
//       //   console.log("Payment received for IMEI:", soundbox_imei, "Amount:", amount);
//       // }



//   // Create the message you want the soundbox to hear
//       const payload = JSON.stringify({
//       status: "SUCCESS",
//       amount: amount
//       });

//       // Publish the message to the specific soundbox's topic
//       const topic = `soundbox/${soundbox_imei}/tx`;
//       client.publish(topic, payload);
      
//       console.log(` Published ₹${amount} to ${topic}`);

//       // 4. FIXED: Always send a response back so the API doesn't hang!
//       res.status(200).json({ 
//       success: true, 
//       message: `Payment received and MQTT notification sent to ${topic}!` 
//       });

//     } catch (error) {
//     // 5. FIXED: Changed 'err' to 'error' to match the catch variable
//     console.error("Server Route Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//     }
//   });

// module.exports = router;