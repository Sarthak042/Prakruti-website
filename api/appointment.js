const { getJsonFile, updateJsonFile } = require('./_github');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email, service, date, message, type } = req.body || {};

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    if (type === 'message') {
      // Save to messages.json
      const msgFilePath = 'data/messages.json';
      const fileData = await getJsonFile(msgFilePath);
      const messagesList = fileData.data || [];
      const newMsg = {
        id: 'msg-' + Date.now(),
        name,
        phone,
        email: email || '',
        message: message || '',
        createdAt: new Date().toISOString()
      };
      messagesList.unshift(newMsg);
      await updateJsonFile(msgFilePath, messagesList, 'New contact message received');
      return res.status(201).json({ success: true, message: 'Message sent successfully', id: newMsg.id });
    } else {
      // Save to appointments.json
      const aptFilePath = 'data/appointments.json';
      const fileData = await getJsonFile(aptFilePath);
      const appointmentsList = fileData.data || [];

      const newApt = {
        id: 'apt-' + Date.now(),
        name,
        phone,
        email: email || '',
        service: service || 'General Consultation',
        date: date || new Date().toISOString().split('T')[0],
        message: message || '',
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      appointmentsList.unshift(newApt);
      await updateJsonFile(aptFilePath, appointmentsList, 'New appointment received');
      return res.status(201).json({ success: true, message: 'Appointment submitted successfully', id: newApt.id });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process appointment: ' + err.message });
  }
};
