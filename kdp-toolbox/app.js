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
renderProjects();
