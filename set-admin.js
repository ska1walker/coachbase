// Quick script to set admin role
const admin = require('firebase-admin');

// Initialize Firebase Admin with your service account
admin.initializeApp({
  projectId: 'teamsport-46873'
});

async function setAdminRole(email) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);

    // Set custom claim
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'admin'
    });

    console.log(`✅ Success! ${email} is now an admin`);
    console.log('⚠️  User must logout and login again for the change to take effect!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2] || 'boehm.kai@gmail.com';
setAdminRole(email);
