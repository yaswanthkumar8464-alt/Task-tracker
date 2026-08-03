// Simple Task Tracker using localStorage
const STORAGE_KEY = 'task-tracker-v1';
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

const taskListEl = document.getElementById('taskList');
const tpl = document.getElementById('taskTpl');
const titleInput = document.getElementById('taskTitle');
const dueInput = document.getElementById('taskDue');
const addBtn = document.getElementById('addBtn');
const filterEl = document.getElementById('filter');
const searchEl = document.getElementById('search');
const sortEl = document.getElementById('sort');
const statsEl = document.getElementById('stats');
const clearCompletedBtn = document.getElementById('clearCompleted');
const clearAllBtn = document.getElementById('clearAll');

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  render();
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

function addTask(title, due) {
  if (!title || !title.trim()) return;
  tasks.unshift({
    id: uid(),
    title: title.trim(),
    due: due || null,
    completed: false,
    createdAt: Date.now()
  });
  save();
}

function updateTask(id, patch) {
  tasks = tasks.map(t => t.id === id ? {...t, ...patch} : t);
  save();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  save();
}

function clearAll() {
  if (!confirm('Clear all tasks?')) return;
  tasks = [];
  save();
}

function formatDue(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString();
}

function render() {
  // apply search, filter, sort
  const q = searchEl.value.trim().toLowerCase();
  let list = tasks.filter(t => t.title.toLowerCase().includes(q));
  const filter = filterEl.value;
  if (filter === 'active') list = list.filter(t => !t.completed);
  if (filter === 'completed') list = list.filter(t => t.completed);

  const sort = sortEl.value;
  if (sort === 'created_desc') list.sort((a,b)=>b.createdAt-a.createdAt);
  if (sort === 'created_asc') list.sort((a,b)=>a.createdAt-b.createdAt);
  if (sort === 'due_asc') list.sort((a,b)=>{
    if (!a.due) return 1;
    if (!b.due) return -1;
    return new Date(a.due)-new Date(b.due);
  });
  if (sort === 'due_desc') list.sort((a,b)=>{
    if (!a.due) return 1;
    if (!b.due) return -1;
    return new Date(b.due)-new Date(a.due);
  });

  taskListEl.innerHTML = '';
  list.forEach(t => {
    const node = tpl.content.cloneNode(true);
    const wrapper = node.querySelector('.task');
    const titleEl = node.querySelector('.title');
    const chk = node.querySelector('.toggle');
    const dueEl = node.querySelector('.due');
    const editBtn = node.querySelector('.edit');
    const delBtn = node.querySelector('.delete');

    titleEl.textContent = t.title;
    if (t.completed) titleEl.classList.add('completed');
    chk.checked = !!t.completed;
    dueEl.textContent = t.due ? `Due ${formatDue(t.due)}` : '';

    chk.addEventListener('change', ()=> updateTask(t.id, {completed: chk.checked}));
    delBtn.addEventListener('click', ()=> {
      if (confirm('Delete this task?')) deleteTask(t.id);
    });

    editBtn.addEventListener('click', ()=> {
      const newTitle = prompt('Edit task title', t.title);
      if (newTitle === null) return;
      const newDue = prompt('Edit due date (YYYY-MM-DD) or leave blank', t.due || '');
      updateTask(t.id, {title: newTitle.trim(), due: newDue ? newDue : null});
    });

    taskListEl.appendChild(node);
  });

  const total = tasks.length;
  const completed = tasks.filter(t=>t.completed).length;
  statsEl.textContent = `${total} tasks • ${completed} completed`;
}

addBtn.addEventListener('click', ()=> {
  addTask(titleInput.value, dueInput.value);
  titleInput.value = '';
  dueInput.value = '';
  titleInput.focus();
});

titleInput.addEventListener('keydown', (e)=> {
  if (e.key === 'Enter') addBtn.click();
});

filterEl.addEventListener('change', render);
searchEl.addEventListener('input', render);
sortEl.addEventListener('change', render);
clearCompletedBtn.addEventListener('click', clearCompleted);
clearAllBtn.addEventListener('click', clearAll);

// keyboard shortcuts
document.addEventListener('keydown', (e)=> {
  if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    titleInput.focus();
  }
});

render();
