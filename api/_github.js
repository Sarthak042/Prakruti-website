const fs = require('fs');
const path = require('path');
const https = require('https');
const jwt = require('jsonwebtoken');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Sarthak042';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Prakruti-website';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const JWT_SECRET = process.env.JWT_SECRET || 'prakruti_secure_jwt_secret_key_2026_98230';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'prakruti@admin2026';

/**
 * Universal HTTP Request Helper for GitHub API
 */
function makeGithubApiRequest(urlPath, method = 'GET', bodyData = null) {
  return new Promise((resolve, reject) => {
    const postData = bodyData ? JSON.stringify(bodyData) : null;
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: urlPath,
      method: method,
      headers: {
        'User-Agent': 'Prakruti-CMS-Vercel-App',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        ...(postData && {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        })
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, body: data });
          }
        } else {
          reject(new Error(`GitHub API HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

/**
 * Verify JWT token from Cookies or Auth Header
 */
function verifyAuth(req) {
  try {
    let token = null;

    if (req.headers && req.headers.authorization) {
      if (req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.substring(7);
      }
    }

    if (!token && req.headers && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, ...v] = cookie.trim().split('=');
        acc[key] = v.join('=');
        return acc;
      }, {});
      token = cookies.token;
    }

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Get JSON content from GitHub REST API with local filesystem fallback
 */
async function getJsonFile(filePath) {
  if (GITHUB_TOKEN) {
    try {
      const apiPath = `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
      const result = await makeGithubApiRequest(apiPath, 'GET');
      if (result.body && result.body.content) {
        const contentStr = Buffer.from(result.body.content, 'base64').toString('utf-8');
        return {
          data: JSON.parse(contentStr),
          sha: result.body.sha
        };
      }
    } catch (err) {
      console.warn(`GitHub API read failed for ${filePath}, using local fallback:`, err.message);
    }
  }

  // Fallback to local file system
  const localPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(localPath)) {
    console.warn(`Data file not found at ${localPath}, returning default empty structure`);
    const defaultData = filePath.includes('settings.json') ? {} : [];
    return {
      data: defaultData,
      sha: 'local-file-sha'
    };
  }

  try {
    const raw = fs.readFileSync(localPath, 'utf-8');
    return {
      data: JSON.parse(raw),
      sha: 'local-file-sha'
    };
  } catch (e) {
    const defaultData = filePath.includes('settings.json') ? {} : [];
    return { data: defaultData, sha: 'local-file-sha' };
  }
}

/**
 * Update JSON content on GitHub REST API with local filesystem fallback
 */
async function updateJsonFile(filePath, jsonObject, commitMessage) {
  const jsonString = JSON.stringify(jsonObject, null, 2);

  if (GITHUB_TOKEN) {
    try {
      const currentFile = await getJsonFile(filePath);
      const sha = currentFile.sha;

      const apiPath = `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
      const base64Content = Buffer.from(jsonString).toString('base64');

      const updatePayload = {
        message: commitMessage || `Update ${filePath}`,
        content: base64Content,
        ...(sha && sha !== 'local-file-sha' && { sha }),
        branch: GITHUB_BRANCH
      };

      const result = await makeGithubApiRequest(apiPath, 'PUT', updatePayload);
      return result.body;
    } catch (err) {
      console.warn(`GitHub API commit failed for ${filePath}, applying local fallback:`, err.message);
    }
  }

  // Local file system fallback
  try {
    const localPath = path.join(process.cwd(), filePath);
    const dirPath = path.dirname(localPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(localPath, jsonString, 'utf-8');
    return { success: true, local: true };
  } catch (err) {
    console.warn(`Local file write fallback skipped in read-only environment:`, err.message);
    return { success: true, memoryOnly: true };
  }
}

module.exports = {
  verifyAuth,
  getJsonFile,
  updateJsonFile,
  GITHUB_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_BRANCH,
  JWT_SECRET,
  ADMIN_USERNAME,
  ADMIN_PASSWORD
};
