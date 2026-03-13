module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Update all users with role 'seeker' or 'referrer' to 'user'
    const result = await db.collection('users').updateMany(
      { role: { $in: ['seeker', 'referrer'] } },
      { $set: { role: 'user' } }
    );
    console.log(`Updated ${result.modifiedCount} users to the 'user' role.`);
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // This is a one-way migration for the role field. 
    // We cannot revert to 'seeker' vs 'referrer' without additional metadata.
    console.log('Down migration for role unification is a no-op.');
  }
};
