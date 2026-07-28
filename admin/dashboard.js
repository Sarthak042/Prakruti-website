/* ==========================================================================
   🏥 प्रकृती (Prakruti) Admin Dashboard JavaScript Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('prakruti_admin_token');

  // Universal Array Extractor
  function ensureArray(val) {
    if (Array.isArray(val)) return val;
    if (val && Array.isArray(val.data)) return val.data;
    return [];
  }

  // Verify login status & GitHub status
  async function checkAuth() {
    try {
      const res = await fetch('/api/github', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.status === 401) {
        localStorage.removeItem('prakruti_admin_token');
        window.location.href = 'login.html';
        return;
      }
      const statusData = await res.json();
      const badge = document.getElementById('githubStatusBadge');
      if (badge && statusData) {
        if (statusData.githubConfigured) {
          badge.innerText = '🟢 GitHub API Connected';
          badge.style.background = '#dcfce7';
          badge.style.color = '#15803d';
        } else {
          badge.innerText = '🟠 GITHUB_TOKEN Missing in Vercel';
          badge.style.background = '#fef3c7';
          badge.style.color = '#b45309';
          badge.title = 'Add GITHUB_TOKEN in Vercel Environment Variables to enable auto-commits';
        }
      }
    } catch (err) {
      console.warn('Auth check skipped or offline:', err);
    }
  }
  checkAuth();

  // Elements
  const menuItems = document.querySelectorAll('.menu-item[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content');
  const pageHeaderTitle = document.getElementById('pageHeaderTitle');
  const logoutBtn = document.getElementById('logoutBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const toastBar = document.getElementById('toastBar');

  // Modal elements
  const modalOverlay = document.getElementById('adminModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  // Toast Function
  function showToast(msg) {
    toastBar.innerText = msg;
    toastBar.classList.add('show');
    setTimeout(() => toastBar.classList.remove('show'), 3500);
  }

  // Modal Functions
  function openModal(title, contentHtml) {
    modalTitle.innerText = title;
    modalBody.innerHTML = contentHtml;
    modalOverlay.classList.add('active');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Sidebar Toggle for Mobile
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/logout', { method: 'POST' });
      } catch (e) {}
      localStorage.removeItem('prakruti_admin_token');
      window.location.href = 'login.html';
    });
  }

  // Tab Navigation
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');

      menuItems.forEach(i => i.classList.remove('active'));
      tabContents.forEach(t => t.classList.remove('active'));

      item.classList.add('active');
      const activeContent = document.getElementById(`${targetTab}Tab`);
      if (activeContent) activeContent.classList.add('active');

      pageHeaderTitle.innerText = item.querySelector('span').innerText;

      if (window.innerWidth <= 992) {
        sidebar.classList.remove('active');
      }

      // Refresh Tab Data
      switch (targetTab) {
        case 'overview': loadOverview(); break;
        case 'appointments': loadAppointments(); break;
        case 'messages': loadMessages(); break;
        case 'treatments': loadTreatments(); break;
        case 'gallery': loadGallery(); break;
        case 'testimonials': loadTestimonials(); break;
        case 'settings': loadSettings(); break;
      }
    });
  });

  // State Stores
  let state = {
    appointments: [],
    messages: [],
    treatments: [],
    gallery: [],
    testimonials: [],
    settings: {}
  };

  // Helper fetch with Auth Header
  async function apiFetch(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      localStorage.removeItem('prakruti_admin_token');
      window.location.href = 'login.html';
      throw new Error('Unauthorized');
    }
    return res;
  }

  /* --------------------------------------------------------------------------
     1. OVERVIEW
     -------------------------------------------------------------------------- */
  async function loadOverview() {
    try {
      const [aptRes, msgRes, galRes, testRes] = await Promise.all([
        apiFetch('/api/appointments').then(r => r.json()).catch(() => []),
        apiFetch('/api/messages').then(r => r.json()).catch(() => []),
        apiFetch('/api/gallery').then(r => r.json()).catch(() => []),
        apiFetch('/api/testimonials').then(r => r.json()).catch(() => [])
      ]);

      const aptList = ensureArray(aptRes);
      const msgList = ensureArray(msgRes);
      const galList = ensureArray(galRes);
      const testList = ensureArray(testRes);

      state.appointments = aptList;
      state.messages = msgList;
      state.gallery = galList;
      state.testimonials = testList;

      const aptEl = document.getElementById('statAppointmentsCount');
      const msgEl = document.getElementById('statMessagesCount');
      const galEl = document.getElementById('statGalleryCount');
      const testEl = document.getElementById('statTestimonialsCount');

      if (aptEl) aptEl.innerText = Number.isInteger(aptList.length) ? aptList.length : 0;
      if (msgEl) msgEl.innerText = Number.isInteger(msgList.length) ? msgList.length : 0;
      if (galEl) galEl.innerText = Number.isInteger(galList.length) ? galList.length : 0;
      if (testEl) testEl.innerText = Number.isInteger(testList.length) ? testList.length : 0;

      // Render Recent Appointments (First 5)
      const tbody = document.getElementById('recentAppointmentsTbody');
      if (aptList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No appointments found.</td></tr>`;
      } else {
        tbody.innerHTML = aptList.slice(0, 5).map(apt => `
          <tr>
            <td><strong>${escapeHtml(apt.name)}</strong></td>
            <td>${escapeHtml(apt.phone)}</td>
            <td>${escapeHtml(apt.service)}</td>
            <td>${escapeHtml(apt.date || 'N/A')}</td>
            <td><span class="badge-status ${apt.status === 'Completed' ? 'badge-completed' : 'badge-pending'}">${apt.status}</span></td>
          </tr>
        `).join('');
      }
    } catch (err) {
      console.error('Failed to load overview:', err);
    }
  }

  document.getElementById('viewAllAppointmentsBtn').addEventListener('click', () => {
    document.querySelector('.menu-item[data-tab="appointments"]').click();
  });

  /* --------------------------------------------------------------------------
     2. APPOINTMENTS MANAGEMENT
     -------------------------------------------------------------------------- */
  let aptPage = 1;
  const aptPerPage = 8;

  async function loadAppointments() {
    try {
      const res = await apiFetch('/api/appointments');
      const data = await res.json();
      state.appointments = ensureArray(data);
      renderAppointments();
    } catch (err) {
      console.error(err);
    }
  }

  function renderAppointments() {
    const searchVal = document.getElementById('aptSearchInput').value.toLowerCase().trim();
    const statusVal = document.getElementById('aptStatusFilter').value;

    let filtered = state.appointments.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchVal) || item.phone.includes(searchVal);
      const matchStatus = statusVal === 'ALL' || item.status === statusVal;
      return matchSearch && matchStatus;
    });

    const tbody = document.getElementById('appointmentsTbody');
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No matching appointments found.</td></tr>`;
      return;
    }

    const start = (aptPage - 1) * aptPerPage;
    const paginated = filtered.slice(start, start + aptPerPage);

    tbody.innerHTML = paginated.map(apt => `
      <tr>
        <td><strong>${escapeHtml(apt.name)}</strong></td>
        <td>${escapeHtml(apt.phone)}</td>
        <td>${escapeHtml(apt.email || 'N/A')}</td>
        <td>${escapeHtml(apt.service)}<br><small style="color:var(--text-muted);">${escapeHtml(apt.date)}</small></td>
        <td><span class="badge-status ${apt.status === 'Completed' ? 'badge-completed' : 'badge-pending'}">${apt.status}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn-action btn-view" onclick="viewAppointment('${apt.id}')">View</button>
            <button class="btn-action ${apt.status === 'Completed' ? 'btn-edit' : 'btn-complete'}" onclick="toggleAptStatus('${apt.id}', '${apt.status}')">
              ${apt.status === 'Completed' ? 'Pending' : 'Complete'}
            </button>
            <button class="btn-action btn-delete" onclick="deleteAppointment('${apt.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  document.getElementById('aptSearchInput').addEventListener('input', renderAppointments);
  document.getElementById('aptStatusFilter').addEventListener('change', renderAppointments);

  window.viewAppointment = (id) => {
    const apt = state.appointments.find(a => a.id === id);
    if (!apt) return;
    openModal('Appointment Details', `
      <div style="line-height: 1.8;">
        <p><strong>Patient Name:</strong> ${escapeHtml(apt.name)}</p>
        <p><strong>Phone Number:</strong> <a href="tel:${apt.phone}">${escapeHtml(apt.phone)}</a></p>
        <p><strong>Email:</strong> ${escapeHtml(apt.email || 'N/A')}</p>
        <p><strong>Service Requested:</strong> ${escapeHtml(apt.service)}</p>
        <p><strong>Preferred Date:</strong> ${escapeHtml(apt.date || 'N/A')}</p>
        <p><strong>Status:</strong> <span class="badge-status ${apt.status === 'Completed' ? 'badge-completed' : 'badge-pending'}">${apt.status}</span></p>
        <p style="margin-top: 12px;"><strong>Patient Message / Symptoms:</strong></p>
        <div style="background:var(--bg-light); padding: 12px; border-radius: 8px; margin-top: 4px;">${escapeHtml(apt.message || 'No additional message provided.')}</div>
      </div>
    `);
  };

  window.toggleAptStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await apiFetch('/api/appointments', {
        method: 'PUT',
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        showToast(`Appointment status updated to ${newStatus}`);
        loadAppointments();
      }
    } catch (err) {
      showToast('Error updating status');
    }
  };

  window.deleteAppointment = async (id) => {
    if (!confirm('Are you sure you want to delete this appointment record?')) return;
    try {
      const res = await apiFetch(`/api/appointments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Appointment record deleted');
        loadAppointments();
      }
    } catch (err) {
      showToast('Error deleting appointment');
    }
  };

  /* --------------------------------------------------------------------------
     3. MESSAGES MANAGEMENT
     -------------------------------------------------------------------------- */
  async function loadMessages() {
    try {
      const res = await apiFetch('/api/messages');
      const data = await res.json();
      state.messages = ensureArray(data);
      renderMessages();
    } catch (err) {
      console.error(err);
    }
  }

  function renderMessages() {
    const searchVal = document.getElementById('msgSearchInput').value.toLowerCase().trim();
    const filtered = state.messages.filter(msg => 
      msg.name.toLowerCase().includes(searchVal) || 
      (msg.message && msg.message.toLowerCase().includes(searchVal))
    );

    const tbody = document.getElementById('messagesTbody');
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No contact messages found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(msg => `
      <tr>
        <td><strong>${escapeHtml(msg.name)}</strong></td>
        <td>${escapeHtml(msg.phone)}<br><small style="color:var(--text-muted);">${escapeHtml(msg.email || 'N/A')}</small></td>
        <td>${escapeHtml((msg.message || '').substring(0, 45))}...</td>
        <td><small>${new Date(msg.createdAt || Date.now()).toLocaleDateString()}</small></td>
        <td>
          <div class="action-btns">
            <button class="btn-action btn-view" onclick="viewMessage('${msg.id}')">View</button>
            <button class="btn-action btn-delete" onclick="deleteMessage('${msg.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  document.getElementById('msgSearchInput').addEventListener('input', renderMessages);

  window.viewMessage = (id) => {
    const msg = state.messages.find(m => m.id === id);
    if (!msg) return;
    openModal('Contact Message Details', `
      <div style="line-height: 1.8;">
        <p><strong>Sender Name:</strong> ${escapeHtml(msg.name)}</p>
        <p><strong>Phone:</strong> <a href="tel:${msg.phone}">${escapeHtml(msg.phone)}</a></p>
        <p><strong>Email:</strong> ${escapeHtml(msg.email || 'N/A')}</p>
        <p><strong>Sent Date:</strong> ${new Date(msg.createdAt || Date.now()).toLocaleString()}</p>
        <p style="margin-top: 12px;"><strong>Message:</strong></p>
        <div style="background:var(--bg-light); padding: 14px; border-radius: 8px; margin-top: 6px;">${escapeHtml(msg.message)}</div>
      </div>
    `);
  };

  window.deleteMessage = async (id) => {
    if (!confirm('Delete this message permanently?')) return;
    try {
      const res = await apiFetch(`/api/messages?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Message deleted');
        loadMessages();
      }
    } catch (err) {
      showToast('Error deleting message');
    }
  };

  /* --------------------------------------------------------------------------
     4. TREATMENTS MANAGEMENT
     -------------------------------------------------------------------------- */
  async function loadTreatments() {
    try {
      const res = await apiFetch('/api/treatments');
      const data = await res.json();
      state.treatments = ensureArray(data);
      renderTreatments();
    } catch (err) {
      console.error(err);
    }
  }

  function renderTreatments() {
    const grid = document.getElementById('treatmentsGrid');
    if (state.treatments.length === 0) {
      grid.innerHTML = `<div>No treatments added yet.</div>`;
      return;
    }

    grid.innerHTML = state.treatments.map(t => `
      <div class="admin-item-card">
        <div class="admin-item-body">
          <div>
            <h3 style="color:var(--primary-green-dark); margin-bottom: 8px;">${escapeHtml(t.name)}</h3>
            <p style="font-size:0.875rem; color:var(--text-muted); margin-bottom: 12px;">${escapeHtml(t.desc)}</p>
            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom: 16px;">
              ${(t.tags || []).map(tag => `<span style="font-size:0.75rem; padding:2px 8px; background:var(--sage-green); border-radius:10px;">${escapeHtml(tag)}</span>`).join('')}
            </div>
          </div>
          <div class="action-btns" style="margin-top: auto;">
            <button class="btn-action btn-edit" onclick="editTreatment('${t.id}')">Edit</button>
            <button class="btn-action btn-delete" onclick="deleteTreatment('${t.id}')">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('addTreatmentBtn').addEventListener('click', () => {
    openModal('Add New Treatment', `
      <form id="treatmentForm">
        <div class="form-group-admin">
          <label class="form-label-admin">Treatment Name</label>
          <input type="text" id="treatName" class="form-control-admin" required placeholder="e.g. Skin Disorders">
        </div>
        <div class="form-group-admin">
          <label class="form-label-admin">Description</label>
          <textarea id="treatDesc" class="form-control-admin" rows="3" required placeholder="Brief description of the treatment..."></textarea>
        </div>
        <div class="form-group-admin">
          <label class="form-label-admin">Tags (comma-separated)</label>
          <input type="text" id="treatTags" class="form-control-admin" placeholder="e.g. Acne, Eczema, Psoriasis">
        </div>
        <button type="submit" class="btn-add" style="width:100%;">Save Treatment</button>
      </form>
    `);

    document.getElementById('treatmentForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('treatName').value.trim(),
        desc: document.getElementById('treatDesc').value.trim(),
        tags: document.getElementById('treatTags').value.trim()
      };
      const res = await apiFetch('/api/treatments', { method: 'POST', body: JSON.stringify(payload) });
      if (res.ok) {
        showToast('Treatment added successfully');
        closeModal();
        loadTreatments();
      }
    });
  });

  window.editTreatment = (id) => {
    const t = state.treatments.find(item => item.id === id);
    if (!t) return;
    openModal('Edit Treatment', `
      <form id="editTreatmentForm">
        <div class="form-group-admin">
          <label class="form-label-admin">Treatment Name</label>
          <input type="text" id="treatName" class="form-control-admin" value="${escapeHtml(t.name)}" required>
        </div>
        <div class="form-group-admin">
          <label class="form-label-admin">Description</label>
          <textarea id="treatDesc" class="form-control-admin" rows="3" required>${escapeHtml(t.desc)}</textarea>
        </div>
        <div class="form-group-admin">
          <label class="form-label-admin">Tags (comma-separated)</label>
          <input type="text" id="treatTags" class="form-control-admin" value="${escapeHtml((t.tags || []).join(', '))}">
        </div>
        <button type="submit" class="btn-add" style="width:100%;">Update Treatment</button>
      </form>
    `);

    document.getElementById('editTreatmentForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        id,
        name: document.getElementById('treatName').value.trim(),
        desc: document.getElementById('treatDesc').value.trim(),
        tags: document.getElementById('treatTags').value.trim()
      };
      const res = await apiFetch('/api/treatments', { method: 'PUT', body: JSON.stringify(payload) });
      if (res.ok) {
        showToast('Treatment updated');
        closeModal();
        loadTreatments();
      }
    });
  };

  window.deleteTreatment = async (id) => {
    if (!confirm('Delete this treatment?')) return;
    const res = await apiFetch(`/api/treatments?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Treatment deleted');
      loadTreatments();
    }
  };

  /* --------------------------------------------------------------------------
     5. GALLERY MANAGEMENT
     -------------------------------------------------------------------------- */
  async function loadGallery() {
    try {
      const res = await apiFetch('/api/gallery');
      const data = await res.json();
      state.gallery = ensureArray(data);
      renderGallery();
    } catch (err) {
      console.error(err);
    }
  }

  function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    if (state.gallery.length === 0) {
      grid.innerHTML = `<div>No gallery images added yet.</div>`;
      return;
    }

    grid.innerHTML = state.gallery.map(img => `
      <div class="admin-item-card">
        <img src="../${escapeHtml(img.image)}" alt="${escapeHtml(img.title)}" class="admin-item-img" onerror="this.src='../assets/images/hero_banner.jpg'">
        <div class="admin-item-body">
          <div>
            <h4 style="color:var(--primary-green-dark);">${escapeHtml(img.title)}</h4>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom: 10px;">Category: ${escapeHtml(img.category)}</div>
            <span class="badge-status ${img.visible ? 'badge-completed' : 'badge-pending'}">${img.visible ? 'Visible' : 'Hidden'}</span>
          </div>
          <div class="action-btns" style="margin-top: 14px;">
            <button class="btn-action btn-edit" onclick="toggleGalleryVisibility('${img.id}', ${img.visible})">${img.visible ? 'Hide' : 'Show'}</button>
            <button class="btn-action btn-delete" onclick="deleteGallery('${img.id}')">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('addGalleryBtn').addEventListener('click', () => {
    openModal('Add Gallery Image URL', `
      <form id="galleryForm">
        <div class="form-group-admin">
          <label class="form-label-admin">Image Title</label>
          <input type="text" id="galTitle" class="form-control-admin" required placeholder="e.g. Doctor Cabin">
        </div>
        <div class="form-group-admin">
          <label class="form-label-admin">Category</label>
          <select id="galCategory" class="form-control-admin">
            <option value="reception">Reception</option>
            <option value="consultation">Consultation Room</option>
            <option value="medicines">Pharmacy</option>
            <option value="waiting">Waiting Area</option>
            <option value="cabin">Doctor Cabin</option>
          </select>
        </div>
        <div class="form-group-admin">
          <label class="form-label-admin">Image File Path / URL</label>
          <input type="text" id="galImage" class="form-control-admin" required placeholder="assets/images/reception.jpg">
        </div>
        <button type="submit" class="btn-add" style="width:100%;">Add Image to Gallery</button>
      </form>
    `);

    document.getElementById('galleryForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById('galTitle').value.trim(),
        category: document.getElementById('galCategory').value,
        image: document.getElementById('galImage').value.trim(),
        visible: true
      };
      const res = await apiFetch('/api/gallery', { method: 'POST', body: JSON.stringify(payload) });
      if (res.ok) {
        showToast('Image added to gallery');
        closeModal();
        loadGallery();
      }
    });
  });

  window.toggleGalleryVisibility = async (id, currentVisible) => {
    const res = await apiFetch('/api/gallery', {
      method: 'PUT',
      body: JSON.stringify({ id, visible: !currentVisible })
    });
    if (res.ok) {
      showToast(`Image visibility updated`);
      loadGallery();
    }
  };

  window.deleteGallery = async (id) => {
    if (!confirm('Delete this gallery image?')) return;
    const res = await apiFetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Gallery image deleted');
      loadGallery();
    }
  };

  /* --------------------------------------------------------------------------
     6. TESTIMONIALS MANAGEMENT
     -------------------------------------------------------------------------- */
  async function loadTestimonials() {
    try {
      const res = await apiFetch('/api/testimonials');
      const data = await res.json();
      state.testimonials = ensureArray(data);
      renderTestimonials();
    } catch (err) {
      console.error(err);
    }
  }

  function renderTestimonials() {
    const grid = document.getElementById('testimonialsGrid');
    if (state.testimonials.length === 0) {
      grid.innerHTML = `<div>No testimonials added yet.</div>`;
      return;
    }

    grid.innerHTML = state.testimonials.map(t => `
      <div class="admin-item-card">
        <div class="admin-item-body">
          <div>
            <div style="color:#f59e0b; margin-bottom: 4px;">${'★'.repeat(t.rating || 5)}</div>
            <h4 style="color:var(--primary-green-dark);">${escapeHtml(t.name)}</h4>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom: 8px;">${escapeHtml(t.location)}</div>
            <p style="font-size:0.875rem; font-style:italic; margin-bottom: 6px;">"${escapeHtml(t.quote_en)}"</p>
            <p style="font-size:0.875rem; color:var(--primary-green-dark);">"${escapeHtml(t.quote_mr)}"</p>
          </div>
          <div class="action-btns" style="margin-top: 14px;">
            <button class="btn-action btn-edit" onclick="editTestimonial('${t.id}')">Edit</button>
            <button class="btn-action btn-delete" onclick="deleteTestimonial('${t.id}')">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('addTestimonialBtn').addEventListener('click', () => {
    openModal('Add Patient Testimonial', `
      <form id="testimonialForm">
        <div class="form-group-admin">
          <label class="form-label-admin">Patient Name</label>
          <input type="text" id="testName" class="form-control-admin" required placeholder="e.g. Rahul Sharma">
        </div>
        <div class="form-group-admin">
          <label class="form-label-admin">Location / Note</label>
          <input type="text" id="testLoc" class="form-control-admin" placeholder="e.g. Kolhapur Patient">
        </div>
        <div class="form-group-admin">
          <label class="form-label-admin">Rating (1 to 5 Stars)</label>
          <select id="testRating" class="form-control-admin">
            <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
            <option value="4">4 Stars ⭐⭐⭐⭐</option>
            <option value="3">3 Stars ⭐⭐⭐</option>
          </select>
        </div>
        <div class="form-group-admin">
          <label class="form-label-admin">English Quote</label>
          <textarea id="testEn" class="form-control-admin" rows="2" placeholder="e.g. Very caring doctor. Excellent treatment."></textarea>
        </div>
        <div class="form-group-admin">
          <label class="form-label-admin">Marathi Quote</label>
          <textarea id="testMr" class="form-control-admin" rows="2" placeholder="e.g. खूप छान उपचार. डॉक्टर अतिशय समजून घेतात."></textarea>
        </div>
        <button type="submit" class="btn-add" style="width:100%;">Save Testimonial</button>
      </form>
    `);

    document.getElementById('testimonialForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('testName').value.trim(),
        location: document.getElementById('testLoc').value.trim(),
        rating: Number(document.getElementById('testRating').value),
        quote_en: document.getElementById('testEn').value.trim(),
        quote_mr: document.getElementById('testMr').value.trim()
      };
      const res = await apiFetch('/api/testimonials', { method: 'POST', body: JSON.stringify(payload) });
      if (res.ok) {
        showToast('Testimonial added');
        closeModal();
        loadTestimonials();
      }
    });
  });

  window.editTestimonial = (id) => {
    const t = state.testimonials.find(item => item.id === id);
    if (!t) return;
    openModal('Edit Testimonial', `
      <form id="editTestimonialForm">
        <div class="form-group-admin">
          <label class="form-label-admin">Patient Name</label>
          <input type="text" id="testName" class="form-control-admin" value="${escapeHtml(t.name)}" required>
        </div>
        <div class="form-group-admin">
          <label class="form-label-admin">Location / Note</label>
          <input type="text" id="testLoc" class="form-control-admin" value="${escapeHtml(t.location)}">
        </div>
        <div class="form-group-admin">
          <label class="form-label-admin">Rating</label>
          <select id="testRating" class="form-control-admin">
            <option value="5" ${t.rating === 5 ? 'selected' : ''}>5 Stars ⭐⭐⭐⭐⭐</option>
            <option value="4" ${t.rating === 4 ? 'selected' : ''}>4 Stars ⭐⭐⭐⭐</option>
            <option value="3" ${t.rating === 3 ? 'selected' : ''}>3 Stars ⭐⭐⭐</option>
          </select>
        </div>
        <div class="form-group-admin">
          <label class="form-label-admin">English Quote</label>
          <textarea id="testEn" class="form-control-admin" rows="2">${escapeHtml(t.quote_en)}</textarea>
        </div>
        <div class="form-group-admin">
          <label class="form-label-admin">Marathi Quote</label>
          <textarea id="testMr" class="form-control-admin" rows="2">${escapeHtml(t.quote_mr)}</textarea>
        </div>
        <button type="submit" class="btn-add" style="width:100%;">Update Testimonial</button>
      </form>
    `);

    document.getElementById('editTestimonialForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        id,
        name: document.getElementById('testName').value.trim(),
        location: document.getElementById('testLoc').value.trim(),
        rating: Number(document.getElementById('testRating').value),
        quote_en: document.getElementById('testEn').value.trim(),
        quote_mr: document.getElementById('testMr').value.trim()
      };
      const res = await apiFetch('/api/testimonials', { method: 'PUT', body: JSON.stringify(payload) });
      if (res.ok) {
        showToast('Testimonial updated');
        closeModal();
        loadTestimonials();
      }
    });
  };

  window.deleteTestimonial = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    const res = await apiFetch(`/api/testimonials?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Testimonial deleted');
      loadTestimonials();
    }
  };

  /* --------------------------------------------------------------------------
     7. SETTINGS MANAGEMENT
     -------------------------------------------------------------------------- */
  async function loadSettings() {
    try {
      const res = await apiFetch('/api/settings');
      state.settings = await res.json();

      document.getElementById('setHospitalName').value = state.settings.hospitalName || '';
      document.getElementById('setDoctorName').value = state.settings.doctorName || '';
      document.getElementById('setDoctorDegree').value = state.settings.doctorDegree || '';
      document.getElementById('setPhone').value = state.settings.phone || '';
      document.getElementById('setEmail').value = state.settings.email || '';
      document.getElementById('setCity').value = state.settings.city || '';
      document.getElementById('setAddress').value = state.settings.address || '';
      document.getElementById('setWorkingHours').value = state.settings.workingHoursWeekdays || '';
      document.getElementById('setMapUrl').value = state.settings.googleMapUrl || '';
      document.getElementById('setHeroHeading').value = state.settings.heroHeading || '';
      document.getElementById('setHeroSubheading').value = state.settings.heroSubheading || '';
      document.getElementById('setMarathiQuotes').value = (state.settings.marathiQuotes || []).join('\n');
      document.getElementById('setFooterText').value = state.settings.footerText || '';
    } catch (err) {
      console.error(err);
    }
  }

  document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('saveSettingsBtn');
    saveBtn.disabled = true;
    saveBtn.innerText = 'Committing to GitHub...';

    const payload = {
      ...state.settings,
      hospitalName: document.getElementById('setHospitalName').value.trim(),
      doctorName: document.getElementById('setDoctorName').value.trim(),
      doctorDegree: document.getElementById('setDoctorDegree').value.trim(),
      phone: document.getElementById('setPhone').value.trim(),
      email: document.getElementById('setEmail').value.trim(),
      city: document.getElementById('setCity').value.trim(),
      address: document.getElementById('setAddress').value.trim(),
      workingHoursWeekdays: document.getElementById('setWorkingHours').value.trim(),
      googleMapUrl: document.getElementById('setMapUrl').value.trim(),
      heroHeading: document.getElementById('setHeroHeading').value.trim(),
      heroSubheading: document.getElementById('setHeroSubheading').value.trim(),
      marathiQuotes: document.getElementById('setMarathiQuotes').value.split('\n').map(s => s.trim()).filter(Boolean),
      footerText: document.getElementById('setFooterText').value.trim()
    };

    try {
      const res = await apiFetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Website settings committed to GitHub successfully!');
        state.settings = payload;
      } else {
        showToast('Failed to save settings');
      }
    } catch (err) {
      showToast('Error saving settings: ' + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerText = 'Save All Changes';
    }
  });

  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('changePasswordBtn');
      const currentPassword = document.getElementById('currPassword').value.trim();
      const newPassword = document.getElementById('newPassword').value.trim();

      if (!currentPassword || !newPassword) {
        showToast('Please enter both current and new password.');
        return;
      }

      btn.disabled = true;
      btn.innerText = 'Updating password...';

      try {
        const res = await apiFetch('/api/change-password', {
          method: 'POST',
          body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('🔐 Password updated successfully! It has been committed to GitHub.');
          changePasswordForm.reset();
        } else {
          showToast(data.error || 'Failed to update password');
        }
      } catch (err) {
        showToast('Error: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerText = 'Update Admin Password';
      }
    });
  }

  // Utility XSS Escaper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Load
  loadOverview();
});
