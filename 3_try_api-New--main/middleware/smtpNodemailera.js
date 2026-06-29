
// Import necessary modules
const express = require("express");
const app = express(); // Correctly initialize the Express app
require("dotenv").config(); // Load environment variables from .env file (still good practice for other variables)
const nodemailer = require("nodemailer"); // Import Nodemailer for email sending


app.use(express.json());


const transporter = nodemailer.createTransport({
  secure: true, // Use SMTPS (secure connection)
  host: "smtp.gmail.com", 
  port: 465, 
  auth: {
    user: "gatikwrking@gmail.com", 
    pass: "nefysbwuonxlalws", 
  },
});

/**
 * Middleware function to send an email.
 * This function expects to be used in an Express route.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The callback function to pass control to the next middleware.
 */
module.exports.seendmail = async (req, res, next) => {
  try {
    // Log that an email sending attempt is being made
    console.log("Attempting to send email...");

    // Send the email using the globally defined transporter.
    const info = await transporter.sendMail({
      from: 'gatikwrking@gmail.com', // Sender email address
      to: "modesta.fisher@ethereal.email", // Recipient email address (hardcoded for this example)
      subject: "YOU ARE BLOCKED", // Email subject
      text: "You have Been Blocked from API and this is a conformational mail that YOU ARE BLOCKED!!!!!!!!!!!!!!!!!!!!!", // Plain-text body
    });

    // Log the message ID returned by the email service
    console.log("Message sent:", info.messageId);
    console.log("Email sent successfully!");

    // --- START OF HIGHLIGHTED CHANGE ---
    // Explicitly check if 'next' is a function before calling it.
    // This helps in diagnosing if 'next' is unexpectedly undefined or null,
    // which was the cause of the "TypeError: next is not a function".
    if (typeof next === 'function') {
      // Call next() to pass control to the next middleware function in the stack.
      // This is the standard behavior for Express middleware.
      next();
    } else {
      // If 'next' is not a function, it means this middleware was likely
      // not called in a standard Express route context (e.g., called directly
      // as a regular function instead of as part of an Express route).
      console.error("Error: 'next' is not a function. This middleware might not be used correctly in an Express route.");
      // Send a 500 error response to terminate the request gracefully.
      // This ensures the server doesn't hang if 'next' cannot be called.
      // return res.status(500).json({
      //   status: "Failed To Process Request",
      //   message: "Server internal error: Middleware chain issue (next not found).",
      // });
    }
    // --- END OF HIGHLIGHTED CHANGE ---

  } catch (error) {
    // Log any errors that occur during the email sending process
    console.log("Error sending email or processing request:", error);

  }
};

// Example Express route where you would use the 'seendmail' middleware.
// You can access this route by sending a POST request to /send-blocked-email
app.post('/send-blocked-email', module.exports.seendmail, (req, res) => {
  // This code will run after the 'seendmail' middleware calls next()
  res.status(200).json({
    status: "Success",
    message: "Email sending process initiated and route continued.",
  });
});
