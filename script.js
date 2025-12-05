// Basic pricing model (adjust values as you like)
const pricing = {
  cameras: 150,     // avg per camera
  locks: 180,       // per smart lock
  lights: 28,       // per smart bulb
  hubs: 90,         // per hub
  installRatePerDevice: 1, // we'll multiply per-device by chosen installLevel value
  defaultInstallPerDevice: 75, // default fallback
};

// init labels and year
document.getElementById('year').innerText = new Date().getFullYear();
['cameras','locks','lights','hubs'].forEach(id => updateLabel(id));
calculate(); // initial calc

function updateLabel(id){
  const el = document.getElementById(id);
  const val = el.value;
  document.getElementById(id + '-val').innerText = val;
}

// calculation function
function calculate(){
  const cam = parseInt(document.getElementById('cameras').value || 0,10);
  const lock = parseInt(document.getElementById('locks').value || 0,10);
  const light = parseInt(document.getElementById('lights').value || 0,10);
  const hub = parseInt(document.getElementById('hubs').value || 0,10);

  const installLevel = Number(document.getElementById('installLevel').value || 0);
  const monitorMonthly = Number(document.getElementById('monitorPlan').value || 0);

  const equipment = (cam * pricing.cameras) + (lock * pricing.locks) + (light * pricing.lights) + (hub * pricing.hubs);
  // Installation: per-device multiply by chosen installLevel (if installLevel is 0, treat as 0)
  const devicesCount = cam + lock + light + hub;
  const install = Math.round(devicesCount * installLevel);

  const monitorAnnual = monitorMonthly * 12;

  const total = equipment + install + monitorAnnual;

  // update UI
  document.getElementById('equip').innerText = formatMoney(equipment);
  document.getElementById('install').innerText = formatMoney(install);
  document.getElementById('monitor').innerText = formatMoney(monitorAnnual);
  document.getElementById('total').innerText = formatMoney(total);

  // also store estimate for form submission
  const estimateText = `Equipment: ${formatMoney(equipment)} | Installation: ${formatMoney(install)} | Monitoring (12mo): ${formatMoney(monitorAnnual)} | Total: ${formatMoney(total)}`;
  document.getElementById('estimateInput').value = estimateText;
}

// format helper
function formatMoney(n){
  return '$' + Number(n).toLocaleString(undefined, {maximumFractionDigits:0});
}

// Download/Print estimate (creates a print-friendly window)
function downloadEstimate(){
  // ensure latest calc
  calculate();
  const estimate = document.getElementById('estimateInput').value;
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

// wire up calc button and inputs
document.querySelectorAll('#cameras,#locks,#lights,#hubs,#installLevel,#monitorPlan').forEach(el=>{
  el.addEventListener('input', calculate);
});
document.getElementById('leadForm').addEventListener('submit', function(e){
  // Netlify will handle form; show success message after short delay
  setTimeout(()=> {
    document.getElementById('formSuccess').style.display = 'block';
    document.getElementById('leadForm').reset();
  }, 500);
});
