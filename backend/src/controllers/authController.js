import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json("Name, email, password and phone are required");
        }

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json("User already exists");

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed,
            phone,
            role
        });

        res.json("User registered successfully");

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

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

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