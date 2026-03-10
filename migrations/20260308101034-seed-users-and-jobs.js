const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

module.exports = {
  async up(db, client) {
    const passwordHash = await bcrypt.hash("password123", 10);
    const referrerId = new ObjectId();
    const seekerId = new ObjectId();

    await db.collection("users").insertMany([
      {
        _id: referrerId,
        name: "Alice Referrer",
        email: "alice@techcorp.com",
        password: passwordHash,
        role: "referrer",
        company: "Tech Corp",
        jobTitle: "Senior Engineer",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: seekerId,
        name: "Bob Seeker",
        email: "bob@seeker.com",
        password: passwordHash,
        role: "seeker",
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    await db.collection("joblistings").insertMany([
      {
        referrerId: referrerId,
        company: "Tech Corp",
        title: "Frontend Developer",
        location: "Remote",
        roleType: "Full-time",
        description: "We are looking for a great frontend developer to join our team. Experience with React and Next.js is a must.",
        experienceLevel: "Mid",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        referrerId: referrerId,
        company: "Tech Corp",
        title: "Backend Engineer",
        location: "New York, NY",
        roleType: "Full-time",
        description: "Looking for an experienced backend engineer familiar with Node.js and MongoDB.",
        experienceLevel: "Senior",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(db, client) {
    await db.collection("joblistings").deleteMany({ company: "Tech Corp" });
    await db.collection("users").deleteMany({ email: { $in: ["alice@techcorp.com", "bob@seeker.com"] } });
  }
};
