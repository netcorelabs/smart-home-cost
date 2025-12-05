// ---------------------------
// Device DB (models, tiers, prices, affiliate URLs)
// Replace affiliate URLs with your real affiliate links.
const devicesDB = {
  cameras: [
    { id: 'cam-basic', name: 'Cam Basic (1080p)', price: 80, desc: '1080p, outdoor-rated, motion detection', affiliate: 'https://example.com/aff/cam-basic' },
    { id: 'cam-pro',   name: 'Cam Pro (2K)', price: 160, desc: '2K, night vision, person detection', affiliate: 'https://example.com/aff/cam-pro' },
    { id: 'cam-prem',  name: 'Cam Premium (4K)', price: 320, desc: '4K, advanced AI, wide field', affiliate: 'https://example.com/aff/cam-prem' }
  ],
  locks: [
    { id: 'lock-basic', name: 'Lock Basic', price: 110, desc: 'Keypad + app', affiliate: 'https://example.com/aff/lock-basic' },
    { id: 'lock-pro', name: 'Lock Pro', price: 200, desc: 'Auto-lock, tamper alerts', affiliate: 'https://example.com/aff/lock-pro' }
  ],
  lights: [
    { id: 'light-basic', name: 'Bulb Basic', price: 12, desc: 'Smart bulb, color temp', affiliate: 'https://example.com/aff/light-basic' },
    { id: 'light-pro', name: 'Bulb Plus', price: 28, desc: 'Color, group control, scenes', affiliate: 'https://example.com/aff/light-pro' }
  ],
  hubs: [
    { id: 'hub-mini', name: 'Hub Mini', price: 60, desc: 'Voice assistant + local hub', affiliate: 'https://example.com/aff/hub-mini' },
    { id: 'hub-pro', name: 'Hub Pro', price: 140, desc: 'Local automation engine, Zigbee/Z-Wave', affiliate: 'https://example.com/aff/hub-pro' }
  ]
};

// ---------------------------
// Analytics config (fill your GA Measurement ID if you want GA)
const GA_MEASUREMENT_ID = ''; // e.g. 'G-XXXXXXXXXX' — if empty GA will not be injected
const PLAUSIBLE_DOMAIN = '';  // e.g. 'yourdomain.com' — if empty Plausible will not be injected

// small helper to inject analytics if provided
(function injectAnalytics(){
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID.trim() !== '') {
    // Google Analytics 4 (gtag)
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    const inline = document.createElement('script');
    inline.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config','${GA_MEASUREMENT_ID}');`;
    document.head.appendChild(inline);
    console.info('GA injected:', GA_MEASUREMENT_ID);
  }
  if (PLAUSIBLE_DOMAIN && PLAUSIBLE_DOMAIN.trim() !== '') {
    const p = document.createElement('script');
    p.defer = true;
    p.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
    p.src = 'https://plausible.io/js/plausible.js';
    document.head.appendChild(p);
    console.info('Plausible injected for domain:', PLAUSIBLE_DOMAIN);
  }
})();

// ---------------------------
// Utilities
function $id(id){ return document.getElementById(id); }
function formatMoney(n){ return '$' + Number(n).toLocaleString(undefined, {maximumFractionDigits:0}); }

// init labels and date
$id('year').innerText = new Date().getFullYear();
$id('example-avg').innerText = formatMoney(3240);

// populate model selects
function populateModelSelects(){
  // cameras
  const cameraSel = $id('cameraModel');
  devicesDB.cameras.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.name} — ${formatMoney(m.price)}`;
    cameraSel.appendChild(opt);
  });

  const lockSel = $id('lockModel');
  devicesDB.locks.forEach(m => lockSel.appendChild(optionFromModel(m)));

  const lightSel = $id('lightModel');
  devicesDB.lights.forEach(m => lightSel.appendChild(optionFromModel(m)));

  const hubSel = $id('hubModel');
  devicesDB.hubs.forEach(m => hubSel.appendChild(optionFromModel(m)));

  // helper
  function optionFromModel(m){
    const o = document.createElement('option');
    o.value = m.id;
    o.textContent = `${m.name} — ${formatMoney(m.price)}`;
    return o;
  }
}

populateModelSelects();
['cameras','locks','lights','hubs'].forEach(id => updateLabel(id));
['camera','lock','light','hub'].forEach(k => updateModelLabel(k));

// initial calc
calculate();
renderComparisonCards(); // populate comparison grid

// ---------------------------
// UI functions
function updateLabel(id){
  const el = $id(id);
  if (!el) return;
  $id(id + '-val').innerText = el.value;
}
function updateModelLabel(kind){
  // kind: camera, lock, light, hub
  const map = { camera: ['cameraModel','camera-desc'], lock: ['lockModel','lock-desc'], light: ['lightModel','light-desc'], hub: ['hubModel','hub-desc']};
  const selId = map[kind][0], descId = map[kind][1];
  const sel = $id(selId);
  const model = findModelById(kind, sel.value);
  $id(descId).innerText = model ? model.desc + ' — ' + formatMoney(model.price) : '';
}

function findModelById(kind, id){
  switch(kind){
    case 'camera': return devicesDB.cameras.find(x=>x.id===id);
    case 'lock': return devicesDB.locks.find(x=>x.id===id);
    case 'light': return devicesDB.lights.find(x=>x.id===id);
    case 'hub': return devicesDB.hubs.find(x=>x.id===id);
    default: return null;
  }
}

// ---------------------------
// calculation function (uses selected models)
function calculate(){
  const camCount = parseInt($id('cameras').value || 0,10);
  const lockCount = parseInt($id('locks').value || 0,10);
  const lightCount = parseInt($id('lights').value || 0,10);
  const hubCount = parseInt($id('hubs').value || 0,10);

  // selected models — fallback to first if none
  const camModel = findModelById('camera', $id('cameraModel').value) || devicesDB.cameras[0];
  const lockModel = findModelById('lock', $id('lockModel').value) || devicesDB.locks[0];
  const lightModel = findModelById('light', $id('lightModel').value) || devicesDB.lights[0];
  const hubModel = findModelById('hub', $id('hubModel').value) || devicesDB.hubs[0];

  const installLevel = Number($id('installLevel').value || 0);
  const monitorMonthly = Number($id('monitorPlan').value || 0);

  const equipment = (camCount * camModel.price) + (lockCount * lockModel.price) + (lightCount * lightModel.price) + (hubCount * hubModel.price);
  const devicesCount = camCount + lockCount + lightCount + hubCount;
  const install = Math.round(devicesCount * installLevel);
  const monitorAnnual = monitorMonthly * 12;
  const total = equipment + install + monitorAnnual;

  // update UI
  $id('equip').innerText = formatMoney(equipment);
  $id('install').innerText = formatMoney(install);
  $id('monitor').innerText = formatMoney(monitorAnnual);
  $id('total').innerText = formatMoney(total);

  // store estimate for form
  const estimateText = `Equipment: ${formatMoney(equipment)} (Cameras: ${camCount}×${camModel.name}, Locks: ${lockCount}×${lockModel.name}, Lights: ${lightCount}×${lightModel.name}, Hubs: ${hubCount}×${hubModel.name}) | Installation: ${formatMoney(install)} | Monitoring (12mo): ${formatMoney(monitorAnnual)} | Total: ${formatMoney(total)}`;
  $id('estimateInput').value = estimateText;
}

// ---------------------------
// render comparison cards for each category (top 2 per category)
function renderComparisonCards(){
  const grid = $id('compare-grid');
  grid.innerHTML = '';

  // flatten categories into list
  const categories = [
    { key: 'cameras', title: 'Cameras' },
    { key: 'locks', title: 'Smart Locks' },
    { key: 'lights', title: 'Smart Lights' },
    { key: 'hubs', title: 'Hubs' }
  ];

  categories.forEach(cat => {
    const arr = devicesDB[cat.key];
    arr.forEach(model => {
      const card = document.createElement('div');
      card.className = 'result';
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div class="label" style="font-weight:800">${model.name}</div>
            <div class="muted small">${cat.title}</div>
            <div class="muted" style="margin-top:6px">${model.desc}</div>
          </div>
          <div style="text-align:right">
            <div class="value">${formatMoney(model.price)}</div>
            <div style="margin-top:8px">
              <a class="btn outline small" href="${model.affiliate}" target="_blank" rel="noopener noreferrer">Product Details</a>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  });
}

// ---------------------------
// Download/Print estimate (keeps same)
function downloadEstimate(){
  calculate();
  const estimate = $id('estimateInput').value;
  const html = `
  <html>
  <head>
    <title>Estimate — SecureHome</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#0b1730}
      h1{color:#1f6feb}
      .box{border:1px solid #e6eefc;padding:18px;border-radius:8px}
      .muted{color:#6b7280}
    </style>
  </head>
  <body>
    <h1>SecureHome — Estimate</h1>
    <div class="muted">Generated on: ${new Date().toLocaleString()}</div>
    <hr/>
    <div class="box"><pre style="font-size:16px">${estimate}</pre></div>
    <p class="muted">Visit https://yourdomain.com for details.</p>
    <script>window.print();</script>
  </body>
  </html>
  `;
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

// ---------------------------
// wire up calc button and inputs
document.querySelectorAll('#cameras,#locks,#lights,#hubs,#installLevel,#monitorPlan').forEach(el=>{
  el.addEventListener('input', function(){
    updateLabel(this.id);
    calculate();
  });
});
document.querySelectorAll('#cameraModel,#lockModel,#lightModel,#hubModel').forEach(el=>{
  el.addEventListener('change', function(){
    const kind = this.id.replace('Model','').replace('camera','camera').replace('lock','lock').replace('light','light').replace('hub','hub');
    updateModelLabel(kind);
    calculate();
  });
});

// Netlify form success UI
document.getElementById('leadForm').addEventListener('submit', function(e){
  setTimeout(()=> {
    document.getElementById('formSuccess').style.display = 'block';
    document.getElementById('leadForm').reset();
  }, 500);
});
