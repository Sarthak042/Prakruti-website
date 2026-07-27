# 🏥 प्रकृती (Prakruti) Homeopathic Hospital - CMS & Serverless Web Platform

A complete, production-ready CMS-driven static website & Serverless API platform built for **प्रकृती (Prakruti) Homeopathic Hospital** & **Dr. Sayali Mahesh Patil (BHMS)**.

The project features a **GitHub-backed JSON Database**, **Vercel Serverless Functions (`/api/*`)**, and a **JWT-Authenticated Admin Panel (`/admin`)**.

---

## 🚀 Features

- **GitHub REST API Storage**: Stores all editable content inside `/data/*.json` files (`settings.json`, `gallery.json`, `treatments.json`, `testimonials.json`, `appointments.json`, `messages.json`). Automatically commits file changes to your GitHub repository with SHA conflict handling.
- **Vercel Serverless Functions (`/api/*`)**:
  - `/api/login` & `/api/logout` — JWT Authentication with HTTP-only Cookies
  - `/api/settings` — Read & update hospital configuration
  - `/api/gallery` — CRUD operations for photo gallery
  - `/api/treatments` — CRUD operations for medical treatment offerings
  - `/api/testimonials` — CRUD operations for patient reviews
  - `/api/appointment` & `/api/appointments` — Public appointment submission & admin management
  - `/api/messages` — Contact form messages management
  - `/api/github` — Storage status check
- **Admin Dashboard (`/admin/dashboard.html`)**:
  - Responsive Dashboard with metric cards
  - Real-time search & status filtering
  - Add/Edit/Delete Modals
  - Toast notifications & loading states
- **Dynamic Frontend (`index.html`)**:
  - Modern medical aesthetic (Emerald Green + Light Gold + Soft White)
  - Dynamically fetches CMS data from Serverless APIs with fallback support

---

## 🛠️ Step-by-Step Deployment Instructions

### 1. Create a GitHub Personal Access Token (PAT)
1. Go to [GitHub Settings -> Developer Settings -> Personal Access Tokens -> Tokens (classic)](https://github.com/settings/tokens).
2. Click **Generate new token (classic)**.
3. Give it a note (e.g. `Prakruti-CMS-Token`).
4. Select scope: **`repo`** (Full control of private and public repositories).
5. Click **Generate token** and copy your token string (starts with `ghp_`).

### 2. Configure GitHub Repository Permissions
1. Push this project to your GitHub account (e.g., `github.com/your-username/prakruti-hospital`).
2. Make sure the default branch is `main`.

### 3. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New Project**.
2. Import your GitHub repository (`prakruti-hospital`).
3. Under **Environment Variables**, add the following 7 environment variables:

| Variable Name | Description | Example Value |
|---|---|---|
| `GITHUB_TOKEN` | GitHub Personal Access Token generated in Step 1 | `ghp_xxxxxxxxxxxx` |
| `GITHUB_OWNER` | Your GitHub Username | `sarthak` |
| `GITHUB_REPO` | GitHub Repository Name | `prakruti-hospital` |
| `GITHUB_BRANCH` | Target Repository Branch | `main` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `prakruti_jwt_secret_2026` |
| `ADMIN_USERNAME` | Admin Panel Login Username | `admin` |
| `ADMIN_PASSWORD` | Admin Panel Login Password | `prakruti@admin2026` |

4. Click **Deploy**.

---

## 🔑 Admin Panel Login

Access the admin dashboard at:
`https://your-domain.vercel.app/admin`

Default Credentials (configurable via Environment Variables):
- **Username**: `admin`
- **Password**: `prakruti@admin2026`

---

## 📂 Project Structure

```
prakruti-hospital/
├── api/
│   ├── _github.js        # GitHub REST API & JWT Helper module
│   ├── login.js          # Admin Auth endpoint
│   ├── logout.js         # Logout session endpoint
│   ├── settings.js       # Hospital settings endpoint
│   ├── gallery.js        # Gallery CRUD endpoint
│   ├── treatments.js     # Treatments CRUD endpoint
│   ├── testimonials.js   # Testimonials CRUD endpoint
│   ├── appointment.js    # Public visitor submission endpoint
│   ├── appointments.js   # Admin appointment management endpoint
│   ├── messages.js       # Admin contact message endpoint
│   └── github.js         # Storage status check endpoint
├── admin/
│   ├── login.html        # Admin login page
│   ├── dashboard.html    # Main CMS Admin Dashboard
│   ├── dashboard.css     # Admin Panel styling
│   └── dashboard.js      # Dashboard JS & API handler
├── data/
│   ├── settings.json     # Hospital settings storage
│   ├── gallery.json      # Gallery items storage
│   ├── treatments.json   # Treatments storage
│   ├── testimonials.json # Testimonials storage
│   ├── appointments.json # Appointments storage
│   └── messages.json     # Messages storage
├── assets/
│   └── images/           # High-resolution clinic photography
├── favicon.svg           # Brand logo icon
├── index.html            # Public website homepage
├── style.css             # Main stylesheet
├── script.js             # Public dynamic frontend logic
├── package.json          # Node dependencies
├── vercel.json           # Vercel deployment routes
└── README.md             # Project documentation
```

---

## ⚡ How GitHub JSON Storage Works

1. **Reading Data**: Serverless functions in `/api` fetch JSON files from the GitHub repository contents API (`api.github.com/repos/{owner}/{repo}/contents/data/*.json`).
2. **Writing Data**: When an admin updates settings, treatments, or gallery items in the Admin Panel (or a visitor submits an inquiry), the serverless function fetches the file's current `sha`, updates the JSON payload, and commits it back to GitHub via a `PUT` request.
3. **Automatic Commits**: Every change creates a git commit directly in your GitHub repository with commit messages like `"New appointment received"` or `"Update website settings"`.

---

## 🔒 Security Best Practices
- The `GITHUB_TOKEN`, `JWT_SECRET`, and `ADMIN_PASSWORD` are securely stored as Vercel Environment Variables and are **never exposed to the browser/frontend**.
- Admin sessions use **HTTP-only, SameSite cookies** to prevent XSS credential theft.

---

© 2026 प्रकृती | Dr. Sayali Mahesh Patil (BHMS). All Rights Reserved.
