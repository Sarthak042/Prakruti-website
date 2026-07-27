const { verifyAuth, getJsonFile, updateJsonFile } = require('./_github');

module.exports = async function handler(req, res) {
  const filePath = 'data/appointments.json';
  const user = verifyAuth(req);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }

  try {
    const fileData = await getJsonFile(filePath);
    let appointmentsList = fileData.data || [];

    if (req.method === 'GET') {
      return res.status(200).json(appointmentsList);
    }

    if (req.method === 'PUT') {
      const { id, status } = req.body || {};
      if (!id || !status) {
        return res.status(400).json({ error: 'Appointment ID and status are required' });
      }

      const index = appointmentsList.findIndex(item => item.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      appointmentsList[index].status = status;
      await updateJsonFile(filePath, appointmentsList, `Update appointment ${id} status to ${status}`);
      return res.status(200).json({ success: true, item: appointmentsList[index], data: appointmentsList });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) {
        return res.status(400).json({ error: 'Appointment ID is required' });
      }

      appointmentsList = appointmentsList.filter(item => item.id !== id);
      await updateJsonFile(filePath, appointmentsList, `Delete appointment: ${id}`);
      return res.status(200).json({ success: true, message: 'Appointment deleted', data: appointmentsList });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Appointments API error: ' + err.message });
  }
};
