const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Institution = require('../models/Institution');
const PendingInstitutionRequest = require('../models/PendingInstitutionRequest');

// POST /api/auth/signup/student - name, email, dateOfBirth, password → redirect to login
exports.signupStudent = async (req, res) => {
  try {
    const { name, email, dateOfBirth, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'STUDENT',
    });
    const dob = dateOfBirth ? new Date(dateOfBirth) : null;
    await Student.create({
      userId: user._id,
      dateOfBirth: isNaN(dob?.getTime()) ? null : dob,
    });
    return res.status(201).json({
      message: 'Signup successful. Please login.',
      redirectTo: '/login',
    });
  } catch (err) {
    console.error('signupStudent error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/signup/institution - institutionName, email, phone, address, document (file) → pending request
exports.signupInstitution = async (req, res) => {
  try {
    const institutionName = (req.body.institutionName || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const phone = (req.body.phone || '').trim();
    const address = (req.body.address || '').trim();
    if (!institutionName || !email) {
      return res.status(400).json({ message: 'Institution name and email are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const existingPending = await PendingInstitutionRequest.findOne({ email, status: 'PENDING' });
    if (existingPending) {
      return res.status(400).json({ message: 'A pending request with this email already exists' });
    }
    const documentPath = req.file ? `/uploads/institution-documents/${req.file.filename}` : null;
    const documentOriginalName = req.file ? req.file.originalname : null;
    await PendingInstitutionRequest.create({
      institutionName,
      email,
      phone,
      address,
      documentPath,
      documentOriginalName,
      status: 'PENDING',
    });
    return res.status(201).json({
      message: 'Request sent to admin. You will be able to login after approval. Else contact admin certimintadmin@gmail.com',
      redirectTo: '/login',
    });
  } catch (err) {
    console.error('signupInstitution error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

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

    if (user.banned) {
      return res.status(403).json({ message: 'Account is banned. Contact admin.' });
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


// GET /api/auth/me - current user profile (requires auth)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('name email role createdAt')
      .lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// PATCH /api/auth/profile - update name (and optionally email) for current user
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = {};
    if (typeof name === 'string' && name.trim()) {
      updates.name = name.trim();
    }
    if (typeof email === 'string' && email.trim()) {
      const newEmail = email.trim().toLowerCase();
      if (newEmail !== user.email) {
        const existing = await User.findOne({ email: newEmail });
        if (existing) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        updates.email = newEmail;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    Object.assign(user, updates);
    await user.save();

    res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// PATCH /api/auth/change-password - current user changes password (requires auth)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('changePassword error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
