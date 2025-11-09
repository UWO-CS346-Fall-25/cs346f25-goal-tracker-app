/**
 * Main JavaScript File
 *
 * This file contains client-side JavaScript for your application.
 * Use vanilla JavaScript (no frameworks) for DOM manipulation and interactions.
 *
 * Common tasks:
 * - Form validation
 * - Interactive UI elements
 * - AJAX requests
 * - Event handling
 */

(function () {
  // ---- Bootstrap: CSRF & namespace -----------------------------------------
  var csrfMeta = document.querySelector('meta[name="csrf-token"]');
  window.__APP__ = window.__APP__ || {};
  window.__APP__.csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : '';

  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function () {
    console.log('Application initialized');
    highlightActiveNav();
    // Example: Form validation
    initFormValidation();
    // Example: Interactive elements
    initInteractiveElements();
  });

  function highlightActiveNav() {
    var links = document.querySelectorAll(
      '#mainNav a[data-path], .nav-links a[data-path]'
    );
    var path = (location.pathname || '/').replace(/\/+$/, '') || '/';
    links.forEach(function (a) {
      if (a.getAttribute('data-path') === path) a.classList.add('active');
    });
  }

  /**
   * Initialize form validation
   */
  function initFormValidation() {
    var forms = document.querySelectorAll('form[data-validate]');

    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        if (!validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  }

  /**
   * Validate a form
   * @param {HTMLFormElement} form - Form element to validate
   * @returns {boolean} - True if form is valid
   */
  function validateForm(form) {
    var isValid = true;
    form.querySelectorAll('.error-message').forEach(function (n) {
      n.remove();
    });
    form.querySelectorAll('.error').forEach(function (n) {
      n.classList.remove('error');
      n.style.borderColor = '';
    });

    var required = form.querySelectorAll('[required]');
    required.forEach(function (field) {
      if (!String(field.value || '').trim()) {
        showError(field, 'This field is required');
        if (isValid) field.focus();
        isValid = false;
      }
    });

    // basic email check if type="email"
    var emails = form.querySelectorAll('input[type="email"]');
    emails.forEach(function (field) {
      var v = String(field.value || '').trim();
      if (v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
        showError(field, 'Enter a valid email');
        if (isValid) field.focus();
        isValid = false;
      }
    });

    return isValid;
  }
  /**
   * Show error message for a field
   * @param {HTMLElement} field - Form field
   * @param {string} message - Error message
   */
  function showError(field, message) {
    // Remove any existing error
    clearError(field);

    // Create error element
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    error.style.color = 'red';
    error.style.fontSize = '0.875rem';
    error.style.marginTop = '0.25rem';
    // Insert after field
    field.parentNode.insertBefore(error, field.nextSibling);
    // Add error class to field
    field.classList.add('error');
    field.style.borderColor = 'red';
  }

  /**
   * Clear error message for a field
   * @param {HTMLElement} field - Form field
   */
  function clearError(field) {
    const error = field.parentNode.querySelector('.error-message');
    if (error) {
      error.remove();
    }
    field.classList.remove('error');
    field.style.borderColor = '';
  }

  /**
   * Initialize interactive elements
   */
  function initInteractiveElements() {
    // Example: Add smooth scrolling to anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach((link) => {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      });
    });

    //  Your Button Interactivity
    //  Local DOM
    const btnLocal = document.getElementById('btnLocal');
    const output1 = document.getElementById('output1');

    if (btnLocal && output1) {
      btnLocal.addEventListener('click', () => {
        output1.textContent = 'You just clicked the local button!';
      });
    }

    // Fetch()
    const btnFetch = document.getElementById('btnFetch');
    const output2 = document.getElementById('output2');

    if (btnFetch && output2) {
      btnFetch.addEventListener('click', async () => {
        const res = await fetch('/hello');
        const data = await res.json();
        output2.textContent = data.message;
      });
    }
  }

  /**
   * Make an AJAX request
   * @param {string} url - Request URL
   * @param {object} options - Request options (method, headers, body, etc.)
   * @returns {Promise<any>} - Response data
   */
  /* eslint-disable no-unused-vars */
  async function makeRequest(url, options = {}) {
    try {
      const method = (options.method || 'GET').toUpperCase();

      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      if (method !== 'GET' && method !== 'HEAD') {
        headers['CSRF-Token'] = window.__APP__.csrfToken || '';
      }
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  /**
   * Display a notification message
   * @param {string} message - Message to display
   * @param {string} type - Type of message (success, error, info, warning)
   */
  /* eslint-disable no-unused-vars */
  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem';
    notification.style.borderRadius = '4px';
    notification.style.backgroundColor =
      type === 'success'
        ? '#28a745'
        : type === 'error'
          ? '#dc3545'
          : type === 'warning'
            ? '#ffc107'
            : '#17a2b8';
    notification.style.color = 'white';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    // Add to page
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s ease';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
})();
