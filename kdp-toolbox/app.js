const $ = (id) => document.getElementById(id);
const storageKey = 'chfandrich-kdp-projects';

function calculatePixels() {
  const width = Number($('width').value);
  const height = Number($('height').value);
  const dpi = Number($('dpi').value);
  if (![width, height, dpi].every((value) => Number.isFinite(value) && value > 0)) {
    $('result').textContent = 'Bitte gültige positive Zahlen eingeben.';
    return;
  }
  $('result').textContent = `${Math.round(width * dpi)} × ${Math.round(height * dpi)} Pixel`;
}

const presets = {
  '8.5x11': [8.5, 11],
  '8x10': [8, 10],
  '8.5x8.5': [8.5, 8.5],
  '6x9': [6, 9]
};

function getSpineWidth(pageCount, paper, binding) {
  const paperbackRates = { white: 0.002252, cream: 0.0025, color: 0.002347 };
  const hardcoverRates = { white: 0.002252, cream: 0.0025, color: 0.002347 };
  const rate = (binding === 'hardcover' ? hardcoverRates : paperbackRates)[paper];
  const boardAllowance = binding === 'hardcover' ? 0.06 : 0;
  return pageCount * rate + boardAllowance;
}

function formatInches(value) {
  return `${value.toFixed(3).replace('.', ',')} Zoll`;
}

function updateCover() {
  const trimWidth = Number($('coverWidth').value);
  const trimHeight = Number($('coverHeight').value);
  const pageCount = Number($('pageCount').value);
  const dpi = Number($('coverDpi').value);
  const bleed = Number($('bleed').value);
  const paper = $('paper').value;
  const binding = $('binding').value;

  const values = [trimWidth, trimHeight, pageCount, dpi, bleed];
  if (!values.every(Number.isFinite) || trimWidth <= 0 || trimHeight <= 0 || pageCount < 24 || dpi <= 0 || bleed < 0) {
    $('coverMetrics').innerHTML = '<div class="metric"><strong>Bitte gültige Maße eingeben.</strong></div>';
    return;
  }

  const spine = getSpineWidth(pageCount, paper, binding);
  const totalWidth = trimWidth * 2 + spine + bleed * 2;
  const totalHeight = trimHeight + bleed * 2;
  const pixelWidth = Math.round(totalWidth * dpi);
  const pixelHeight = Math.round(totalHeight * dpi);
  const spinePercent = Math.max(2.2, Math.min(18, (spine / totalWidth) * 100));

  $('coverPreview').style.setProperty('--spine', `${spinePercent}%`);
  $('coverPreview').style.setProperty('--cover', $('coverColor').value);
  $('previewTitle').textContent = $('coverTitle').value.trim() || 'Buchtitel';
  $('previewSpine').textContent = ($('coverTitle').value.trim() || 'Buchtitel').toUpperCase();
  $('previewSubtitle').textContent = $('coverSubtitle').value.trim() || 'Untertitel';
  $('previewAuthor').textContent = $('coverAuthor').value.trim() || 'Autor';
  $('previewBrand').textContent = $('coverAuthor').value.trim() || 'CH.FANDRICH®';

  const metrics = [
    ['Beschnittformat', `${formatInches(totalWidth)} × ${formatInches(totalHeight)}`],
    ['Rückenbreite', formatInches(spine)],
    ['Pixel bei ' + dpi + ' DPI', `${pixelWidth} × ${pixelHeight} px`],
    ['Vorderseite', `${formatInches(trimWidth)} × ${formatInches(trimHeight)}`],
    ['Seitenzahl', `${pageCount} Seiten`],
    ['Bindung', binding === 'hardcover' ? 'Gebundene Ausgabe' : 'Taschenbuch']
  ];
  $('coverMetrics').innerHTML = metrics.map(([label, value]) => `<div class="metric"><small>${label}</small><strong>${value}</strong></div>`).join('');
}

function applyPreset() {
  const preset = presets[$('trimPreset').value];
  if (preset) {
    $('coverWidth').value = preset[0];
    $('coverHeight').value = preset[1];
  }
  updateCover();
}

function resetCover() {
  $('trimPreset').value = '8.5x11';
  $('binding').value = 'paperback';
  $('paper').value = 'white';
  $('pageCount').value = 112;
  $('coverWidth').value = 8.5;
  $('coverHeight').value = 11;
  $('coverDpi').value = 300;
  $('bleed').value = 0.125;
  $('coverTitle').value = 'Tierwelten';
  $('coverSubtitle').value = 'Mein großes Malbuch';
  $('coverAuthor').value = 'CH.FANDRICH®';
  $('coverColor').value = '#243b53';
  updateCover();
}

function loadProjects() {
  try { return JSON.parse(localStorage.getItem(storageKey)) ?? []; }
  catch { return []; }
}

function saveProjects(projects) {
  localStorage.setItem(storageKey, JSON.stringify(projects));
}

function renderProjects() {
  const projects = loadProjects();
  $('projects').innerHTML = projects.length ? projects.map((project, index) => `
    <div class="project">
      <div><strong>${escapeHtml(project.title)}</strong><br><small>${escapeHtml(project.type)} · ${escapeHtml(project.status)}</small></div>
      <button data-delete="${index}">Löschen</button>
    </div>`).join('') : '<p>Noch keine Projekte gespeichert.</p>';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
}

$('calculate').addEventListener('click', calculatePixels);
$('trimPreset').addEventListener('change', applyPreset);
$('resetCover').addEventListener('click', resetCover);
$('coverForm').addEventListener('input', (event) => {
  if (event.target.id === 'coverWidth' || event.target.id === 'coverHeight') $('trimPreset').value = 'custom';
  updateCover();
});
$('addProject').addEventListener('click', () => {
  const title = $('projectTitle').value.trim();
  if (!title) return;
  const projects = loadProjects();
  projects.push({ title, type: $('projectType').value, status: $('projectStatus').value });
  saveProjects(projects);
  $('projectTitle').value = '';
  renderProjects();
});
$('projects').addEventListener('click', (event) => {
  const index = event.target.dataset.delete;
  if (index === undefined) return;
  const projects = loadProjects();
  projects.splice(Number(index), 1);
  saveProjects(projects);
  renderProjects();
});

calculatePixels();
updateCover();
renderProjects();
