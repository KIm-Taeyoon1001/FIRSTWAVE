import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const code = await readFile(new URL('../site/demo.js', import.meta.url), 'utf8');
const data = new Map();
const session = new Map();
const storage = map => ({ getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) });

let submitLogin;
const loginFields = {
  'demo-login': { addEventListener: (_, handler) => { submitLogin = handler; } },
  'demo-email': { value: 'demo@firstwave.app' },
  'demo-password': { value: 'wrong' },
  'login-error': { textContent: '', hidden: true },
};
let destination = '';
runInNewContext(code, {
  document: { getElementById: id => loginFields[id] ?? null },
  sessionStorage: storage(session),
  window: { location: { assign: path => { destination = path; } } },
});
submitLogin({ preventDefault() {} });
if (session.size || loginFields['login-error'].hidden) throw new Error('Invalid demo login was accepted');
loginFields['demo-password'].value = 'Firstwave123!';
submitLogin({ preventDefault() {} });
if (destination !== '/dashboard/' || session.get('firstwave-demo-session') !== 'active') throw new Error('Valid demo login failed');

let createProject, submitProject, viewClick, viewInput, clearProjects, showProjects;
const title = { textContent: '' }, description = { textContent: '' }, newButton = { hidden: false, addEventListener: (_, handler) => { createProject = handler; } };
const viewRoot = { innerHTML: '', addEventListener: (type, handler) => { if (type === 'click') viewClick = handler; if (type === 'input') viewInput = handler; } };
const projectForm = { addEventListener: (_, handler) => { submitProject = handler; } };
const nav = ['overview','projects','applications','feedback','analytics','settings'].map(view => ({ dataset: { view }, classList: { toggle() {} }, addEventListener: (_, handler) => { if (view === 'settings') clearProjects = handler; if (view === 'projects') showProjects = handler; } }));
const elements = {
  'demo-view': viewRoot, 'view-title': title, 'view-description': description,
  'new-project': newButton, 'demo-logout': { addEventListener() {} },
  'project-form': projectForm, 'cancel-project': { addEventListener() {} },
};
const formValues = [
  ['name','<script>Sample</script>'],['tagline','A useful test product'],['description','A sufficiently detailed product description for the local preview.'],
  ['category','Developer Tools'],['platform','Web'],['capacity','5'],['requirements','Developers'],['instructions','Try onboarding'],
];
runInNewContext(code, {
  document: { getElementById: id => elements[id] ?? null, querySelectorAll: () => nav },
  sessionStorage: storage(session), localStorage: storage(data),
  window: { confirm: () => true, location: { replace() { throw new Error('Active session redirected'); }, assign() {} } },
  crypto: { randomUUID: () => 'demo-project-1' },
  FormData: class { constructor() { return formValues; } },
});
if (!viewRoot.innerHTML.includes('Total projects') || !viewRoot.innerHTML.includes('<strong>0</strong>')) throw new Error('Empty dashboard did not render');
createProject();
if (title.textContent !== 'New project' || !submitProject) throw new Error('Project editor did not open');
submitProject({ preventDefault() {}, currentTarget: projectForm });
const projects = JSON.parse(data.get('firstwave-demo-projects') || '[]');
if (projects.length !== 1 || !viewRoot.innerHTML.includes('&lt;script&gt;Sample')) throw new Error('Project save or HTML escaping failed');
viewClick({ target: { closest: () => ({ dataset: { action: 'submit', id: 'demo-project-1' } }) } });
if (JSON.parse(data.get('firstwave-demo-projects'))[0].status !== 'pending_review') throw new Error('Review status did not update');
showProjects();
if (!viewRoot.innerHTML.includes('&lt;script&gt;Sample')) throw new Error('Project list did not render saved project');
viewClick({ target: { closest: () => ({ dataset: { action: 'filter', filter: 'draft' } }) } });
if (!viewRoot.innerHTML.includes('No matching projects')) throw new Error('Project status filter did not apply');
viewClick({ target: { closest: () => ({ dataset: { action: 'filter', filter: 'all' } }) } });
viewInput({ target: { id: 'project-search', value: 'not found', selectionStart: 0 } });
if (!viewRoot.innerHTML.includes('No matching projects')) throw new Error('Project search did not apply');
clearProjects();
viewClick({ target: { closest: () => ({ dataset: { action: 'clear' } }) } });
if (data.has('firstwave-demo-projects')) throw new Error('Local project reset failed');
console.log('Demo flow OK: login, project creation, escaping, review state, search, filters and reset');
