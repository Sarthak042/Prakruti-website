const { verifyAuth, getJsonFile, updateJsonFile } = require('./_github');

module.exports = async function handler(req, res) {
  const filePath = 'data/testimonials.json';

  if (req.method === 'GET') {
    try {
      const fileData = await getJsonFile(filePath);
      return res.status(200).json(fileData.data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to read testimonials: ' + err.message });
    }
  }

  const user = verifyAuth(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }

  try {
    const fileData = await getJsonFile(filePath);
    let testimonialsList = fileData.data || [];

    if (req.method === 'POST') {
      const { name, location, rating, quote_en, quote_mr } = req.body || {};
      if (!name) {
        return res.status(400).json({ error: 'Patient name is required' });
      }
      const newItem = {
        id: 'test-' + Date.now(),
        name,
        location: location || 'Verified Patient',
        rating: Number(rating) || 5,
        quote_en: quote_en || '',
        quote_mr: quote_mr || ''
      };
      testimonialsList.unshift(newItem);
      await updateJsonFile(filePath, testimonialsList, `Add testimonial: ${newItem.name}`);
      return res.status(201).json({ success: true, item: newItem, data: testimonialsList });
    }

    if (req.method === 'PUT') {
      const { id, name, location, rating, quote_en, quote_mr } = req.body || {};
      const index = testimonialsList.findIndex(item => item.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Testimonial not found' });
      }

      testimonialsList[index] = {
        ...testimonialsList[index],
        ...(name !== undefined && { name }),
        ...(location !== undefined && { location }),
        ...(rating !== undefined && { rating: Number(rating) }),
        ...(quote_en !== undefined && { quote_en }),
        ...(quote_mr !== undefined && { quote_mr })
      };

      await updateJsonFile(filePath, testimonialsList, `Update testimonial: ${id}`);
      return res.status(200).json({ success: true, item: testimonialsList[index], data: testimonialsList });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) {
        return res.status(400).json({ error: 'Testimonial ID is required' });
      }
      testimonialsList = testimonialsList.filter(item => item.id !== id);
      await updateJsonFile(filePath, testimonialsList, `Delete testimonial: ${id}`);
      return res.status(200).json({ success: true, message: 'Testimonial deleted', data: testimonialsList });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Testimonials API error: ' + err.message });
  }
};
