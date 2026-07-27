const { verifyAuth, getJsonFile, updateJsonFile, ADMIN_USERNAME, ADMIN_PASSWORD } = require('./_github');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyAuth(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }

  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const filePath = 'data/settings.json';
    const fileData = await getJsonFile(filePath);
    const settingsData = fileData.data || {};

    const activePassword = settingsData.adminPassword || ADMIN_PASSWORD;

    if (currentPassword !== activePassword) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    // Update password in settings.json
    settingsData.adminPassword = newPassword;

    await updateJsonFile(filePath, settingsData, 'Update admin password');

    return res.status(200).json({
      success: true,
      message: 'Admin password updated successfully!'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update password: ' + err.message });
  }
};
