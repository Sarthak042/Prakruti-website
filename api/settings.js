const { verifyAuth, getJsonFile, updateJsonFile } = require('./_github');

module.exports = async function handler(req, res) {
  const filePath = 'data/settings.json';

  if (req.method === 'GET') {
    try {
      const fileData = await getJsonFile(filePath);
      return res.status(200).json(fileData.data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to read settings: ' + err.message });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const user = verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }

    try {
      const updatedSettings = req.body;
      if (!updatedSettings || typeof updatedSettings !== 'object') {
        return res.status(400).json({ error: 'Invalid settings payload' });
      }

      await updateJsonFile(filePath, updatedSettings, 'Update website settings');
      return res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: updatedSettings
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update settings: ' + err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
