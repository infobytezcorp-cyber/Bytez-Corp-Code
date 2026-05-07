import User from "../models/User.js";
import Agent from "../models/Agent.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json("All fields required");
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json("User already exists");

    const hashed = await bcrypt.hash(password, 10);

    //  1. Create USER
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role
    });

    //  2. If telecaller → create AGENT
    if (role === "telecaller") {
      await Agent.create({
        name: user.name,
        linkedUser: user._id,
        status: "offline"
      });
    }

    res.json({
      success: true,
      message: "User + Agent created (if telecaller)"
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json("User not found");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json("Wrong password");

    // const token = jwt.sign(
    //     { id: user._id, role: user.role },
    //     process.env.JWT_SECRET,
    //     { expiresIn: "1h" }
    // );

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    if (user.role === "telecaller") {
      const now = new Date();
      await Agent.findOneAndUpdate(
        { linkedUser: user._id },
        {
          $set: {
            loginTime: now,
            status: "available"
          }
        },
        { returnDocument: "after" }
      );
    }

    // if (user.role === "telecaller") {
    //   await Agent.findOneAndUpdate(
    //     { linkedUser: user._id },
    //     {
    //       $set: { loginTime: new Date() },
    //       $push: {
    //         loginHistory: {
    //           loginTime: new Date()
    //         }
    //       }
    //     },
    //     { returnDocument: "after" }
    //   );
    // }


    res.json({
      token,
      role: user.role,
      name: user.name,
      email: user.email
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
};