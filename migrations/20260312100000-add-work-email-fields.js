module.exports = {
  async up(db) {
    await db.collection("users").updateMany(
      { workEmailVerified: { $exists: false } },
      { $set: { workEmailVerified: false } }
    );
  },

  async down(db) {
    await db.collection("users").updateMany(
      {},
      { $unset: { workEmail: "", workEmailVerified: "", workEmailVerifyToken: "", workEmailVerifyExpires: "" } }
    );
  },
};
