
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Institution = require('../models/Institution');


exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // ✅ Prevent public signup as ADMIN
    // Only allow STUDENT / INSTITUTION from the client request.
    const allowedRoles = ["STUDENT", "INSTITUTION"];
    const safeRole = allowedRoles.includes(role) ? role : "STUDENT";

    // 1️⃣ Create base user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: safeRole,
    });

    // 2️⃣ Auto-create profile depending on role
    if (user.role === "STUDENT") {
      await Student.create({
        userId: user._id,
      });
    } 
    else if (user.role === "INSTITUTION") {
      await Institution.create({
        userId: user._id,
        name: user.name,      // using their signup name
        address: "",          // optional for now
        contactNumber: "",
        locationUrl: "",
      });
    }

    // 3️⃣ Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role,email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4️⃣ Response
    res.status(201).json({
      message: 'Signup successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // don’t reveal whether email exists
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role,email: user.email,  },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
