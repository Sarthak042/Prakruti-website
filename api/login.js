const jwt = require('jsonwebtoken');
const { JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD } = require('./_github');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body || {};

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { username: ADMIN_USERNAME, role: 'admin', time: Date.now() },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set HTTP-only Cookie
      res.setHeader('Set-Cookie', [
        `token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`
      ]);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        username: ADMIN_USERNAME
      });
    } else {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Login server error: ' + err.message });
  }
};
