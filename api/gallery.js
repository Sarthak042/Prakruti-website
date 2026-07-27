const { verifyAuth, getJsonFile, updateJsonFile } = require('./_github');

module.exports = async function handler(req, res) {
  const filePath = 'data/gallery.json';

  if (req.method === 'GET') {
    try {
      const fileData = await getJsonFile(filePath);
      return res.status(200).json(fileData.data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to read gallery: ' + err.message });
    }
  }

  // Require auth for modification
  const user = verifyAuth(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }

  try {
    const fileData = await getJsonFile(filePath);
    let galleryList = fileData.data || [];

    if (req.method === 'POST') {
      const { title, category, image, visible } = req.body || {};
      if (!image) {
        return res.status(400).json({ error: 'Image URL is required' });
      }
      const newItem = {
        id: 'gal-' + Date.now(),
        title: title || 'Gallery Image',
        category: category || 'general',
        image: image,
        visible: visible !== undefined ? Boolean(visible) : true
      };
      galleryList.unshift(newItem);
      await updateJsonFile(filePath, galleryList, `Add gallery image: ${newItem.title}`);
      return res.status(201).json({ success: true, item: newItem, data: galleryList });
    }

    if (req.method === 'PUT') {
      const { id, title, category, image, visible } = req.body || {};
      const index = galleryList.findIndex(item => item.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Gallery item not found' });
      }

      galleryList[index] = {
        ...galleryList[index],
        ...(title !== undefined && { title }),
        ...(category !== undefined && { category }),
        ...(image !== undefined && { image }),
        ...(visible !== undefined && { visible: Boolean(visible) })
      };

      await updateJsonFile(filePath, galleryList, `Update gallery image: ${id}`);
      return res.status(200).json({ success: true, item: galleryList[index], data: galleryList });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) {
        return res.status(400).json({ error: 'Image ID is required' });
      }
      galleryList = galleryList.filter(item => item.id !== id);
      await updateJsonFile(filePath, galleryList, `Delete gallery image: ${id}`);
      return res.status(200).json({ success: true, message: 'Image deleted', data: galleryList });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Gallery API error: ' + err.message });
  }
};
