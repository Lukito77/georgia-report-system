(function () {
  'use strict';

  var form          = document.getElementById('submission-form');
  var thankYou      = document.getElementById('thank-you');
  var submitBtn     = document.getElementById('submit-btn');
  var submitAnother = document.getElementById('submit-another');

  var problemInput  = document.getElementById('problem');
  var areaSelect    = document.getElementById('area');
  var citySelect    = document.getElementById('city');
  var consentInput  = document.getElementById('consent');
  var imageInput    = document.getElementById('image');
  var cameraInput   = document.getElementById('camera');

  var problemError  = document.getElementById('problem-error');
  var areaError     = document.getElementById('area-error');
  var cityError     = document.getElementById('city-error');
  var consentError  = document.getElementById('consent-error');
  var imageError    = document.getElementById('image-error');
  var formError     = document.getElementById('form-error');
  var attachLabel   = document.getElementById('attach-label');

  var selectedFile  = null;

  var LOCATIONS = {};

  function populateOptions(sel, values, placeholder) {
    sel.innerHTML = '';
    var blank = document.createElement('option');
    blank.value = '';
    blank.textContent = placeholder;
    sel.appendChild(blank);
    values.forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      sel.appendChild(opt);
    });
  }

  function loadLocations() {
    return fetch('/locations.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        LOCATIONS = data;
        populateOptions(areaSelect, Object.keys(LOCATIONS), '-- აირჩიეთ მხარე --');
      })
      .catch(function () {
        formError.textContent = 'მონაცემები ვერ ჩაიტვირთა. გთხოვთ განაახლოთ გვერდი.';
      });
  }

  areaSelect.addEventListener('change', function () {
    var area = areaSelect.value;
    if (!area) {
      populateOptions(citySelect, [], '-- ჯერ აირჩიეთ მხარე --');
      citySelect.disabled = true;
      return;
    }
    var cities = LOCATIONS[area] || [];
    populateOptions(citySelect, cities, '-- აირჩიეთ ქალაქი --');
    citySelect.disabled = false;
  });

  function setFieldError(inputEl, errorEl, msg) {
    errorEl.textContent = msg || '';
    if (msg) inputEl.classList.add('input-error');
    else     inputEl.classList.remove('input-error');
  }

  function clearAllErrors() {
    setFieldError(problemInput, problemError, '');
    setFieldError(areaSelect,   areaError,    '');
    setFieldError(citySelect,   cityError,    '');
    setFieldError(consentInput, consentError, '');
    imageError.textContent = '';
    formError.textContent  = '';
  }

  function removeFile() {
    selectedFile = null;
    attachLabel.innerHTML = '';
    imageInput.value = '';
    cameraInput.value = '';
    imageError.textContent = '';
  }

  function handleFileSelect(file) {
    if (!file) return;
    var allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      imageError.textContent = 'მხოლოდ JPG, PNG ან WEBP ფორმატი.';
      selectedFile = null;
      attachLabel.innerHTML = '';
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      imageError.textContent = 'ფაილი ძალიან დიდია (მაქს. 50MB).';
      selectedFile = null;
      attachLabel.innerHTML = '';
      return;
    }
    imageError.textContent = '';
    selectedFile = file;

    // წავიკითხოთ ფაილი და thumbnail გამოვაჩინოთ
    var reader = new FileReader();
    reader.onload = function (e) {
      attachLabel.innerHTML = '';

      // thumbnail კონტეინერი
      var wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:relative;display:inline-block;margin-top:8px;';

      // preview სურათი
      var img = document.createElement('img');
      img.src = e.target.result;
      img.style.cssText = 'width:72px;height:72px;object-fit:cover;border-radius:8px;display:block;border:1px solid #ddd;';

      // წაშლის ღილაკი
      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '✕';
      removeBtn.style.cssText = [
        'position:absolute',
        'top:-6px',
        'right:-6px',
        'width:18px',
        'height:18px',
        'border-radius:50%',
        'background:#c0392b',
        'color:#fff',
        'border:none',
        'cursor:pointer',
        'font-size:11px',
        'line-height:18px',
        'text-align:center',
        'padding:0',
        'display:flex',
        'align-items:center',
        'justify-content:center',
      ].join(';');
      removeBtn.addEventListener('click', removeFile);

      wrapper.appendChild(img);
      wrapper.appendChild(removeBtn);
      attachLabel.appendChild(wrapper);
    };
    reader.readAsDataURL(file);
  }

  document.getElementById('attach-btn').addEventListener('click', function () {
    imageInput.click();
  });

  document.getElementById('camera-btn').addEventListener('click', function () {
    cameraInput.click();
  });

  imageInput.addEventListener('change', function () {
    handleFileSelect(this.files[0]);
  });

  cameraInput.addEventListener('change', function () {
    handleFileSelect(this.files[0]);
  });

  problemInput.addEventListener('input',  function () { if (problemError.textContent) setFieldError(problemInput, problemError, ''); });
  areaSelect.addEventListener('change',   function () { if (areaError.textContent)    setFieldError(areaSelect,   areaError,    ''); });
  citySelect.addEventListener('change',   function () { if (cityError.textContent)    setFieldError(citySelect,   cityError,    ''); });
  consentInput.addEventListener('change', function () { if (consentError.textContent) setFieldError(consentInput, consentError, ''); });

  function validate() {
    var ok = true;
    var problem = problemInput.value.trim();

    if (!problem) {
      setFieldError(problemInput, problemError, 'გთხოვთ აღწეროთ პრობლემა.');
      ok = false;
    } else if (problem.length > 5000) {
      setFieldError(problemInput, problemError, 'მაქს. 5000 სიმბოლო.');
      ok = false;
    }
    if (!areaSelect.value) {
      setFieldError(areaSelect, areaError, 'გთხოვთ აირჩიოთ მხარე.');
      ok = false;
    }
    if (!citySelect.value) {
      setFieldError(citySelect, cityError, 'გთხოვთ აირჩიოთ ქალაქი.');
      ok = false;
    }
    if (!consentInput.checked) {
      setFieldError(consentInput, consentError, 'გთხოვთ დაეთანხმოთ პირობებს.');
      ok = false;
    }
    return ok;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearAllErrors();
    if (!validate()) return;

    var originalLabel = submitBtn.textContent;
    submitBtn.disabled    = true;
    submitBtn.textContent = 'იგზავნება...';

    try {
      var formData = new FormData();
      formData.append('problem', problemInput.value.trim());
      formData.append('area',    areaSelect.value);
      formData.append('city',    citySelect.value);
      formData.append('consent', consentInput.checked);
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      var res = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      var data = {};
      try { data = await res.json(); } catch (_) {}

      if (!res.ok) {
        formError.textContent = data.error || 'შეცდომა. სცადეთ თავიდან.';
        return;
      }

      form.classList.add('hidden');
      thankYou.classList.remove('hidden');
      form.reset();
      removeFile();
      populateOptions(citySelect, [], '-- ჯერ აირჩიეთ მხარე --');
      citySelect.disabled = true;
      thankYou.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      formError.textContent = 'ქსელის შეცდომა. სცადეთ თავიდან.';
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = originalLabel;
    }
  });

  submitAnother.addEventListener('click', function () {
    thankYou.classList.add('hidden');
    form.classList.remove('hidden');
    clearAllErrors();
    problemInput.focus();
  });

  document.getElementById('consent-text').textContent = t('consentText');

  loadLocations();
})();