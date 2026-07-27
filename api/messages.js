const { verifyAuth, getJsonFile, updateJsonFile } = require('./_github');

module.exports = async function handler(req, res) {
  const filePath = 'data/messages.json';
  const user = verifyAuth(req);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }

  try {
    const fileData = await getJsonFile(filePath);
    let messagesList = fileData.data || [];

    if (req.method === 'GET') {
      return res.status(200).json(messagesList);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) {
        return res.status(400).json({ error: 'Message ID is required' });
      }

      messagesList = messagesList.filter(item => item.id !== id);
      await updateJsonFile(filePath, messagesList, `Delete message: ${id}`);
      return res.status(200).json({ success: true, message: 'Message deleted', data: messagesList });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Messages API error: ' + err.message });
  }
};
