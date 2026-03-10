const bcrypt = require("bcryptjs");

module.exports = {
  async up(db) {
    const email = process.env.ADMIN_SEED_EMAIL || "admin@referralhub.com";
    const name = process.env.ADMIN_SEED_NAME || "ReferralHub Admin";
    const passwordPlain = process.env.ADMIN_SEED_PASSWORD || "Admin@12345";
    const now = new Date();
    const passwordHash = await bcrypt.hash(passwordPlain, 10);

    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          name,
          role: "admin",
          isVerified: true,
          updatedAt: now,
        },
        $setOnInsert: {
          email,
          password: passwordHash,
          createdAt: now,
        },
      },
      { upsert: true }
    );
  },

  async down(db) {
    const email = process.env.ADMIN_SEED_EMAIL || "admin@referralhub.com";
    await db.collection("users").deleteOne({ email, role: "admin" });
  },
};
