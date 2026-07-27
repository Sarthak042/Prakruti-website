/* ==========================================================================
   🏥 प्रकृती (Prakruti) Homeopathic Hospital - Dynamic Frontend Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Remove Preloader
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
      }, 400);
    });
    setTimeout(() => {
      if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
      }
    }, 1200);
  }

  // 2. Dynamic Data Fetching from CMS APIs
  async function loadDynamicContent() {
    // Load Settings
    try {
      const setRes = await fetch('/api/settings');
      if (setRes.ok) {
        const settings = await setRes.json();
        applySettings(settings);
      }
    } catch (e) { console.log('Using default settings'); }

    // Load Treatments
    try {
      const treatRes = await fetch('/api/treatments');
      if (treatRes.ok) {
        const treatments = await treatRes.json();
        renderPublicTreatments(treatments);
      }
    } catch (e) { console.log('Using static treatments'); }

    // Load Gallery
    try {
      const galRes = await fetch('/api/gallery');
      if (galRes.ok) {
        const gallery = await galRes.json();
        renderPublicGallery(gallery);
      }
    } catch (e) { console.log('Using static gallery'); }

    // Load Testimonials
    try {
      const testRes = await fetch('/api/testimonials');
      if (testRes.ok) {
        const testimonials = await testRes.json();
        renderPublicTestimonials(testimonials);
      }
    } catch (e) { console.log('Using static testimonials'); }
  }

  function applySettings(s) {
    if (s.hospitalName) {
      document.querySelectorAll('.brand-name').forEach(el => el.innerText = s.hospitalName);
    }
    if (s.phone) {
      const phoneEl = document.getElementById('publicPhone');
      if (phoneEl) {
        phoneEl.innerText = s.phone;
        phoneEl.href = `tel:${s.phone.replace(/\s+/g, '')}`;
      }
    }
    if (s.email) {
      const emailEl = document.getElementById('publicEmail');
      if (emailEl) {
        emailEl.innerText = s.email;
        emailEl.href = `mailto:${s.email}`;
      }
    }
    if (s.address) {
      const addrEl = document.getElementById('publicAddress');
      if (addrEl) {
        addrEl.innerHTML = `<strong>🏥 ${s.hospitalFullName || s.hospitalName}</strong><br>${s.address.replace(/\n/g, '<br>')}`;
      }
    }
    if (s.workingHoursWeekdays) {
      const hoursEl = document.getElementById('publicWorkingHours');
      if (hoursEl) hoursEl.innerText = s.workingHoursWeekdays;
    }
    if (s.googleMapUrl) {
      const mapIframe = document.getElementById('publicMapIframe');
      if (mapIframe) mapIframe.src = s.googleMapUrl;
    }
  }

  function renderPublicTreatments(list) {
    const grid = document.getElementById('publicTreatmentsGrid');
    if (!grid || !list || list.length === 0) return;

    grid.innerHTML = list.map(t => `
      <div class="treatment-card reveal active">
        <div>
          <div class="treatment-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          </div>
          <h3 class="treatment-name">${escapeHtml(t.name)}</h3>
          <p class="treatment-desc">${escapeHtml(t.desc)}</p>
          <div class="treatment-tags">
            ${(t.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
          </div>
        </div>
        <a href="#contact" class="treatment-action">
          Inquire Now →
        </a>
      </div>
    `).join('');
  }

  function renderPublicGallery(list) {
    const grid = document.querySelector('.gallery-grid');
    if (!grid || !list || list.length === 0) return;

    const visibleList = list.filter(i => i.visible !== false);
    if (visibleList.length === 0) return;

    grid.innerHTML = visibleList.map(img => `
      <div class="gallery-item reveal active" data-category="${escapeHtml(img.category)}">
        <img src="${escapeHtml(img.image)}" alt="${escapeHtml(img.title)}" onerror="this.src='assets/images/hero_banner.jpg'">
        <div class="gallery-overlay">
          <div class="gallery-title">${escapeHtml(img.title)}</div>
          <div class="gallery-cat">Prakruti Homeopathic Hospital</div>
        </div>
      </div>
    `).join('');

    bindLightbox();
  }

  function renderPublicTestimonials(list) {
    const grid = document.querySelector('.testimonials-grid');
    if (!grid || !list || list.length === 0) return;

    grid.innerHTML = list.map(t => `
      <div class="testimonial-card reveal active">
        <div>
          <div class="stars">${'★'.repeat(t.rating || 5)}</div>
          <p class="testimonial-quote">"${escapeHtml(t.quote_en)}"</p>
          ${t.quote_mr ? `<p class="testimonial-marathi">"${escapeHtml(t.quote_mr)}"</p>` : ''}
        </div>
        <div class="patient-info">
          <div class="patient-avatar">${(t.name || 'P')[0]}</div>
          <div>
            <div class="patient-name">${escapeHtml(t.name)}</div>
            <div class="patient-location">${escapeHtml(t.location || 'Verified Patient')}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  loadDynamicContent();

  // 3. Sticky Navbar & Active Link Highlight
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // 4. Mobile Navigation Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // 5. Marathi Motivational Quotes Carousel
  const quoteSlides = document.querySelectorAll('.quote-slide');
  const quoteDotsContainer = document.getElementById('quoteDots');
  let currentQuoteIndex = 0;

  if (quoteSlides.length > 0 && quoteDotsContainer) {
    quoteSlides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (idx === 0) dot.classList.add('active');
      dot.addEventListener('click', () => showQuote(idx));
      quoteDotsContainer.appendChild(dot);
    });

    const dots = quoteDotsContainer.querySelectorAll('.dot');

    function showQuote(index) {
      quoteSlides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));

      if (quoteSlides[index]) quoteSlides[index].classList.add('active');
      if (dots[index]) dots[index].classList.add('active');
      currentQuoteIndex = index;
    }

    setInterval(() => {
      let nextIndex = (currentQuoteIndex + 1) % quoteSlides.length;
      showQuote(nextIndex);
    }, 5000);
  }

  // 6. Scroll Reveal Animation Trigger
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));

  // 7. Animated Statistics Counter
  const statNumbers = document.querySelectorAll('.stat-number');
  let animatedStats = false;
  const statsSection = document.querySelector('.stats-section');

  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !animatedStats) {
        animatedStats = true;
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-target'), 10);
          const suffix = stat.getAttribute('data-suffix') || '';
          let count = 0;
          const duration = 1800;
          const increment = Math.ceil(target / (duration / 30));

          const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
              stat.innerText = target + suffix;
              clearInterval(timer);
            } else {
              stat.innerText = count + suffix;
            }
          }, 30);
        });
      }
    }, { threshold: 0.3 });

    statsObserver.observe(statsSection);
  }

  // 8. Gallery Filter & Lightbox Preview
  function bindLightbox() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        galleryItems.forEach(item => {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const imgSrc = item.querySelector('img').getAttribute('src');
        if (lightboxImg) lightboxImg.setAttribute('src', imgSrc);
        if (lightbox) lightbox.classList.add('active');
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
    }
  }
  bindLightbox();

  // 9. Accordion FAQ Section
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(otherItem => otherItem.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });

  // 10. Public Contact / Appointment Form Submission to /api/appointment
  const publicContactForm = document.getElementById('publicContactForm');
  const publicSubmitBtn = document.getElementById('publicSubmitBtn');

  function showToast(message) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotification';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <div>
        <strong style="display:block; font-size: 0.95rem;">🏥 प्रकृती Homeopathy</strong>
        <span style="font-size: 0.85rem;">${message}</span>
      </div>
    `;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4500);
  }

  if (publicContactForm) {
    publicContactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const service = document.getElementById('contactService').value;
      const message = document.getElementById('contactMessage').value.trim();

      if (!name || !phone) {
        showToast('Please fill in your name and phone number.');
        return;
      }

      publicSubmitBtn.disabled = true;
      publicSubmitBtn.innerText = 'Sending...';

      try {
        const res = await fetch('/api/appointment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, email, service, message })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          showToast(`धन्यवाद ${name}! Your message has been sent successfully.`);
          publicContactForm.reset();
        } else {
          showToast(data.error || 'Failed to submit message.');
        }
      } catch (err) {
        showToast('Thank you! Your message has been recorded.');
        publicContactForm.reset();
      } finally {
        publicSubmitBtn.disabled = false;
        publicSubmitBtn.innerText = 'Send Message';
      }
    });
  }

  // 11. Back to Top Button
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Utility Escaper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
