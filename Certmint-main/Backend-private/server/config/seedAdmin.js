const bcrypt = require("bcryptjs");
const User = require("./models/User");

/**
 * Ensures a default admin exists.
 * Creates: admin@gmail.com / admin (role ADMIN)
 * Does NOT overwrite if user already exists.
 */
async function seedDefaultAdmin() {
  const email = "admin@gmail.com";
  const password = "admin";

  const existing = await User.findOne({ email }).lean();
  if (existing) return;

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  await User.create({
    name: "Admin",
    email,
    passwordHash,
    role: "ADMIN",
  });

  console.log("✅ Default admin created: admin@gmail.com / admin");
}

module.exports = seedDefaultAdmin;

