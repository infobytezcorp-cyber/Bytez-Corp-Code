import express from "express";
import Otp from "../models/Otp.js";
import twilio from "twilio";
import Visitor from "../models/VisitorModule.js";

const router = express.Router();

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  console.log("OTP:", otp);

  await Otp.create({
    phone,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  try {
    // CREATE CLIENT HERE (NOT TOP)
    const client = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH
    );

    console.log("SID:", process.env.TWILIO_SID);
    console.log("AUTH:", process.env.TWILIO_AUTH);
    console.log("PHONE:", process.env.TWILIO_PHONE);

    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`,
    });

    res.json({ success: true, message: "OTP Sent" });

  } catch (error) {
    // console.log("SMS Error:", error.message);
    console.log("FULL ERROR:", error);
    res.status(500).json({ success: false });
  }
});


// router.post("/verify-otp", async (req, res) => {
//   const { phone, otp } = req.body;

//   console.log("Verify Request:", phone, otp); // 👈 DEBUG

//   const record = await Otp.findOne({ phone, otp });

//   if (!record) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid OTP",
//     });
//   }

//   if (record.expiresAt < new Date()) {
//     return res.status(400).json({
//       success: false,
//       message: "OTP Expired",
//     });
//   }

//   res.json({ success: true });
// });

router.post("/verify-otp", async (req, res) => {
  const { name, phone, otp } = req.body;

  const record = await Otp.findOne({ phone, otp });

  if (!record) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  if (record.expiresAt < new Date()) {
    return res.status(400).json({
      success: false,
      message: "OTP Expired",
    });
  }

  // CREATE VISITOR HERE
  const visitor = await Visitor.create({
    name,
    phone,
    checkInTime: new Date(),
    status: "Checked-In",
  });

  // RETURN VISITOR ID
  res.json({
    success: true,
    _id: visitor._id,
    visitor,
  });
});

export default router;