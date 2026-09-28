(function() {
  var form = document.querySelector('[data-inquiry-form]');
  if (!form) return;

  var endpoint = form.getAttribute('data-endpoint');
  var status = form.querySelector('[data-inquiry-status]');
  var submit = form.querySelector('[type="submit"]');
  var lastSubmitAt = 0;

  function setStatus(message, type) {
    status.textContent = message;
    status.className = 'inquiry-status inquiry-status-' + type;
  }

  function getValue(name) {
    var field = form.elements[name];
    return field ? field.value.trim() : '';
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    var now = Date.now();
    if (now - lastSubmitAt < 15000) {
      setStatus('Please wait a moment before submitting again.', 'error');
      return;
    }

    if (!endpoint || endpoint.indexOf('your-function-endpoint') !== -1) {
      setStatus('The inquiry endpoint is not configured yet.', 'error');
      return;
    }

    var payload = {
      subject: form.getAttribute('data-subject') || 'Website Inquiry',
      source: form.getAttribute('data-source') || 'About page',
      name: getValue('name'),
      email: getValue('email'),
      mobile: getValue('mobile'),
      country: getValue('country'),
      products: getValue('products'),
      message: getValue('message'),
      website: getValue('website')
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus('Please fill in Name / Company, E-mail, and Message.', 'error');
      return;
    }

    if (!isEmail(payload.email)) {
      setStatus('Please enter a valid e-mail address.', 'error');
      return;
    }

    submit.disabled = true;
    lastSubmitAt = now;
    setStatus('Sending your inquiry...', 'sending');

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function(response) {
        if (!response.ok) throw new Error('Request failed');
        return response.json().catch(function() { return {}; });
      })
      .then(function() {
        form.reset();
        setStatus('Thanks. Your inquiry has been sent successfully.', 'success');
      })
      .catch(function() {
        setStatus('Sorry, the inquiry could not be sent. Please email us directly.', 'error');
      })
      .finally(function() {
        submit.disabled = false;
      });
  });
})();

