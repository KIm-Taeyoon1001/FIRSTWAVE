const SESSION_KEY = 'firstwave-demo-session';
const PROJECTS_KEY = 'firstwave-demo-projects';
const email = 'demo@firstwave.app';
const password = 'Firstwave123!';
const login = document.getElementById('demo-login');

if (login) login.addEventListener('submit', event => {
  event.preventDefault();
  const enteredEmail = document.getElementById('demo-email').value.trim().toLowerCase();
  const enteredPassword = document.getElementById('demo-password').value;
  const error = document.getElementById('login-error');
  if (enteredEmail !== email || enteredPassword !== password) {
    error.textContent = 'Use the preview account shown below to continue.';
    error.hidden = false;
    return;
  }
  sessionStorage.setItem(SESSION_KEY, 'active');
  window.location.assign('/dashboard/');
});

const viewRoot = document.getElementById('demo-view');
if (viewRoot) {
  if (sessionStorage.getItem(SESSION_KEY) !== 'active') window.location.replace('/login/');
  else startDashboard();
}

function startDashboard() {
  let view = 'overview';
  let editId = null;
  let projectQuery = '';
  let projectFilter = 'all';
  const nav = [...document.querySelectorAll('[data-view]')];
  const title = document.getElementById('view-title');
  const description = document.getElementById('view-description');
  const newButton = document.getElementById('new-project');
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  };
  const save = projects => localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const empty = (heading, body) => `<div class="demo-empty"><h3>${heading}</h3><p>${body}</p></div>`;
  const projectRow = project => `<article class="demo-project-row"><div class="demo-project-mark" aria-hidden="true">${escape(project.name.slice(0,1).toUpperCase())}</div><div class="demo-project-info"><div class="demo-project-name"><strong>${escape(project.name)}</strong><span class="demo-status ${escape(project.status)}">${escape(project.status.replace('_',' '))}</span></div><p>${escape(project.tagline)}</p><div class="demo-project-meta"><span>${escape(project.category)}</span><span>${escape(project.platform)}</span><span>${escape(project.capacity)} tester spots</span></div></div><div class="demo-project-actions"><button class="button small light" data-action="edit" data-id="${escape(project.id)}">Edit</button>${project.status === 'draft' ? `<button class="button small" data-action="submit" data-id="${escape(project.id)}">Submit for review</button>` : ''}${project.status === 'pending_review' ? `<button class="button small light" data-action="draft" data-id="${escape(project.id)}">Back to draft</button>` : ''}<button class="button small light" data-action="delete" data-id="${escape(project.id)}">Delete</button></div></article>`;
  function render() {
    const projects = read();
    const headings = {overview:['Overview','Your campaign workspace in one place.'],projects:['My Projects','Create and prepare your beta campaigns.'],applications:['Applications','Applicant review will be available with live accounts.'],feedback:['Feedback','Structured responses will appear after tester participation.'],analytics:['Analytics','Campaign numbers come from your local preview projects.'],editor:[editId ? 'Edit project' : 'New project','Prepare your campaign before moderation.']};
    headings.settings = ['Demo settings', 'Manage the data stored in this browser.'];
    [title.textContent, description.textContent] = headings[view];
    const section = document.getElementById('view-section');
    if (section) section.textContent = view === 'editor' ? 'PROJECTS' : view.toUpperCase();
    nav.forEach(button => button.classList.toggle('active',button.dataset.view === view));
    newButton.hidden = view === 'editor';
    if (view === 'overview') viewRoot.innerHTML = `<div class="demo-banner">Local preview · Projects stay in this browser. Applications and feedback need the connected service.</div><div class="demo-overview-layout"><div class="demo-overview-main"><section class="demo-panel"><div class="demo-panel-heading"><div><span class="demo-kicker">YOUR WORK</span><h2>Recent projects</h2></div><button class="demo-text-button" data-action="view-projects">View all projects →</button></div>${projects.length ? projects.slice(-4).reverse().map(projectRow).join('') : empty('No projects yet','Create a draft to start organizing your beta test.')}</section><section class="demo-panel"><div class="demo-panel-heading"><div><span class="demo-kicker">TESTING</span><h2>Applications & feedback</h2></div></div><div class="demo-split-stats"><div><strong>0</strong><span>Applications received</span></div><div><strong>0</strong><span>Selected testers</span></div><div><strong>0</strong><span>Feedback received</span></div></div><p class="demo-panel-note">These numbers will come from real campaign activity after the service is connected.</p></section></div><aside class="demo-overview-aside"><section class="demo-panel"><span class="demo-kicker">CAMPAIGN STATUS</span><h2>At a glance</h2><div class="demo-status-line"><span>Total projects</span><strong>${projects.length}</strong></div><div class="demo-status-line"><span>Drafts</span><strong>${projects.filter(p => p.status === 'draft').length}</strong></div><div class="demo-status-line"><span>Pending review</span><strong>${projects.filter(p => p.status === 'pending_review').length}</strong></div></section><section class="demo-panel"><span class="demo-kicker">NEXT STEPS</span><h2>Get started</h2><ol class="demo-list"><li>Create a project draft</li><li>Describe who should test it</li><li>Prepare the campaign for review</li></ol><button class="demo-text-button" data-action="new-project">Create a project →</button></section></aside></div>`;
    if (view === 'projects') {
      const filtered = projects.slice().reverse().filter(project => (projectFilter === 'all' || project.status === projectFilter) && `${project.name} ${project.tagline} ${project.category}`.toLowerCase().includes(projectQuery.toLowerCase()));
      viewRoot.innerHTML = `<div class="demo-banner">Campaign review is a preview state. Publishing requires the live moderation service.</div><section class="demo-panel demo-project-list"><div class="demo-panel-heading"><div><span class="demo-kicker">CAMPAIGNS</span><h2>Projects <span class="demo-count">${projects.length}</span></h2></div><label class="demo-search"><span class="sr-only">Search projects</span><input id="project-search" type="search" placeholder="Search projects" value="${escape(projectQuery)}" autocomplete="off"></label></div><div class="demo-filter-bar" role="group" aria-label="Filter projects">${[['all','All'],['draft','Drafts'],['pending_review','Pending review']].map(([key,label]) => `<button data-action="filter" data-filter="${key}" class="${projectFilter === key ? 'active' : ''}" aria-pressed="${projectFilter === key}">${label}</button>`).join('')}</div>${filtered.length ? filtered.map(projectRow).join('') : empty(projects.length ? 'No matching projects' : 'No projects yet',projects.length ? 'Try another search or status filter.' : 'Start with a draft and add your product details.')}</section>`;
    }
    if (view === 'applications') viewRoot.innerHTML = `<section class="demo-panel"><h2>Received applications</h2>${empty('No applications yet','Real testers can apply after your project is published on the connected service.')}</section><section class="demo-panel"><h2>My tester applications</h2>${empty('No participation yet','Explore and apply to campaigns when the live marketplace opens.')}</section>`;
    if (view === 'feedback') viewRoot.innerHTML = `<section class="demo-panel"><h2>Project feedback</h2>${empty('No feedback yet','Responses from approved testers will appear here.')}</section>`;
    if (view === 'analytics') viewRoot.innerHTML = `<div class="demo-grid"><div class="demo-metric"><span>Total projects</span><strong>${projects.length}</strong></div><div class="demo-metric"><span>Applications received</span><strong>0</strong></div><div class="demo-metric"><span>Feedback submitted</span><strong>0</strong></div></div><section class="demo-panel"><h2>Project breakdown</h2>${projects.length ? projects.map(p => `<div class="feature-row"><span>${escape(p.name)}</span><span class="demo-status ${escape(p.status)}">${escape(p.status.replace('_',' '))}</span></div>`).join('') : empty('No analytics yet','Create a project to begin tracking your campaigns.')}</section>`;
    if (view === 'settings') viewRoot.innerHTML = `<section class="demo-panel"><span class="eyebrow">LOCAL PREVIEW</span><h2 style="margin-top:14px">Your browser is the workspace</h2><p style="color:#a9bbae;font-size:13px">${projects.length} local ${projects.length === 1 ? 'project is' : 'projects are'} saved on this device. This demo does not sync with an account or database.</p><button class="button light" data-action="clear">Clear local projects</button></section><section class="demo-panel"><h2>Ready for the real platform?</h2><p style="color:#a9bbae;font-size:13px">Real sign in, team access, tester applications, and feedback will be enabled after the service is connected.</p><a class="small-link" href="/developers/">See the developer workflow →</a></section>`;
    if (view === 'editor') {
      const project = projects.find(p => p.id === editId) || {};
      const selected = (value, current) => value === current ? 'selected' : '';
      viewRoot.innerHTML = `<section class="demo-panel"><form id="project-form" class="demo-form"><label>Project name<input class="field" name="name" value="${escape(project.name)}" minlength="2" maxlength="100" required placeholder="Your product name"></label><label>Category<select name="category"><option ${selected('Developer Tools',project.category)}>Developer Tools</option><option ${selected('Productivity',project.category)}>Productivity</option><option ${selected('Design',project.category)}>Design</option><option ${selected('Education',project.category)}>Education</option><option ${selected('Finance',project.category)}>Finance</option><option ${selected('Other',project.category)}>Other</option></select></label><label class="wide">Short description<input class="field" name="tagline" value="${escape(project.tagline)}" minlength="5" maxlength="180" required placeholder="Describe the product in one sentence"></label><label class="wide">Product description<textarea name="description" minlength="30" required placeholder="What does the product do, and what are you hoping to learn?">${escape(project.description)}</textarea></label><label>Platform<select name="platform"><option ${selected('Web',project.platform)}>Web</option><option ${selected('iOS',project.platform)}>iOS</option><option ${selected('Android',project.platform)}>Android</option><option ${selected('Desktop',project.platform)}>Desktop</option><option ${selected('API',project.platform)}>API</option></select></label><label>Tester spots<input class="field" name="capacity" type="number" min="1" max="10000" value="${escape(project.capacity || 10)}" required></label><label class="wide">Tester requirements<textarea name="requirements" placeholder="Who would be a good tester?">${escape(project.requirements)}</textarea></label><label class="wide">Testing instructions<textarea name="instructions" placeholder="What should testers try?">${escape(project.instructions)}</textarea></label><div class="demo-form-actions"><button class="button">Save draft</button><button type="button" class="button light" id="cancel-project">Cancel</button></div></form></section>`;
      document.getElementById('project-form').addEventListener('submit', event => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(event.currentTarget));
        const next = {id:editId || crypto.randomUUID(),status:'draft',name:String(values.name).trim(),tagline:String(values.tagline).trim(),description:String(values.description).trim(),category:String(values.category),platform:String(values.platform),capacity:Number(values.capacity),requirements:String(values.requirements).trim(),instructions:String(values.instructions).trim()};
        const list = read(); const index = list.findIndex(p => p.id === editId);
        if (index < 0) list.push(next); else list[index] = next;
        save(list); editId = null; view = 'projects'; render();
      });
      document.getElementById('cancel-project').addEventListener('click', () => { editId = null; view = 'projects'; render(); });
    }
  }
  nav.forEach(button => button.addEventListener('click', () => { view = button.dataset.view; editId = null; render(); }));
  newButton.addEventListener('click', () => { editId = null; view = 'editor'; render(); });
  document.getElementById('demo-logout').addEventListener('click', () => { sessionStorage.removeItem(SESSION_KEY); window.location.assign('/login/'); });
  viewRoot.addEventListener('click', event => {
    const button = event.target.closest('[data-action]'); if (!button) return;
    const id = button.dataset.id, action = button.dataset.action;
    if (action === 'view-projects') { view = 'projects'; render(); return; }
    if (action === 'new-project') { editId = null; view = 'editor'; render(); return; }
    if (action === 'filter') { projectFilter = button.dataset.filter; render(); return; }
    if (action === 'clear') { if (window.confirm('Clear all local demo projects from this browser?')) { localStorage.removeItem(PROJECTS_KEY); render(); } return; }
    if (action === 'edit') { editId = id; view = 'editor'; render(); return; }
    if (action === 'delete' && !window.confirm('Delete this local demo project?')) return;
    const list = read(); const index = list.findIndex(p => p.id === id); if (index < 0) return;
    if (action === 'delete') list.splice(index,1);
    if (action === 'submit') list[index].status = 'pending_review';
    if (action === 'draft') list[index].status = 'draft';
    save(list); render();
  });
  viewRoot.addEventListener('input', event => {
    if (event.target.id !== 'project-search') return;
    projectQuery = event.target.value;
    const cursor = event.target.selectionStart;
    render();
    const field = document.getElementById('project-search');
    field?.focus();
    if (cursor !== null) field?.setSelectionRange(cursor, cursor);
  });
  render();
}
