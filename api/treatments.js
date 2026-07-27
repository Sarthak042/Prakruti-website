const { verifyAuth, getJsonFile, updateJsonFile } = require('./_github');

module.exports = async function handler(req, res) {
  const filePath = 'data/treatments.json';

  if (req.method === 'GET') {
    try {
      const fileData = await getJsonFile(filePath);
      return res.status(200).json(fileData.data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to read treatments: ' + err.message });
    }
  }

  const user = verifyAuth(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }

  try {
    const fileData = await getJsonFile(filePath);
    let treatmentsList = fileData.data || [];

    if (req.method === 'POST') {
      const { name, desc, icon, tags } = req.body || {};
      if (!name) {
        return res.status(400).json({ error: 'Treatment name is required' });
      }
      const newItem = {
        id: 'treat-' + Date.now(),
        name,
        desc: desc || '',
        icon: icon || 'stethoscope',
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : [])
      };
      treatmentsList.unshift(newItem);
      await updateJsonFile(filePath, treatmentsList, `Add treatment: ${newItem.name}`);
      return res.status(201).json({ success: true, item: newItem, data: treatmentsList });
    }

    if (req.method === 'PUT') {
      const { id, name, desc, icon, tags } = req.body || {};
      const index = treatmentsList.findIndex(item => item.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Treatment not found' });
      }

      treatmentsList[index] = {
        ...treatmentsList[index],
        ...(name !== undefined && { name }),
        ...(desc !== undefined && { desc }),
        ...(icon !== undefined && { icon }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()) })
      };

      await updateJsonFile(filePath, treatmentsList, `Update treatment: ${id}`);
      return res.status(200).json({ success: true, item: treatmentsList[index], data: treatmentsList });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) {
        return res.status(400).json({ error: 'Treatment ID is required' });
      }
      treatmentsList = treatmentsList.filter(item => item.id !== id);
      await updateJsonFile(filePath, treatmentsList, `Delete treatment: ${id}`);
      return res.status(200).json({ success: true, message: 'Treatment deleted', data: treatmentsList });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Treatments API error: ' + err.message });
  }
};
