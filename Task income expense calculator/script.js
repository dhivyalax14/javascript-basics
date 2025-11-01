
const descriptionEl = document.getElementById('description');
const amountEl = document.getElementById('amount');
const typeEl = document.getElementById('type');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const entriesBody = document.getElementById('entriesBody');
const incomeTotalEl = document.getElementById('income-total');
const expenseTotalEl = document.getElementById('expense-total');
const netTotalEl = document.getElementById('net-total');
const filterEls = document.getElementsByName('filter');

let entries = [];      
let editId = null;     


const STORAGE_KEY = 'trackerEntries';


function init() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      entries = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored entries', e);
      entries = [];
    }
  }
  render();
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}


function updateSummary() {
  const income = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const expense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const net = income - expense;

  incomeTotalEl.textContent = income.toFixed(2);
  expenseTotalEl.textContent = expense.toFixed(2);
  netTotalEl.textContent = net.toFixed(2);
}


function getFilter() {
  for (const f of filterEls) {
    if (f.checked) return f.value;
  }
  return 'all';
}


function renderList() {
  const filter = getFilter();
  entriesBody.innerHTML = '';

  const filtered = entries.filter(e => filter === 'all' || e.type === filter);

  filtered.forEach(entry => {
    const tr = document.createElement('tr');

    const tdDesc = document.createElement('td');
    tdDesc.textContent = entry.description;
    tr.appendChild(tdDesc);

    const tdAmount = document.createElement('td');
    tdAmount.textContent = entry.amount.toFixed(2);
    tr.appendChild(tdAmount);

    const tdType = document.createElement('td');
    tdType.textContent = entry.type;
    tr.appendChild(tdType);

    const tdActions = document.createElement('td');
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(entry.id));
    tdActions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteEntry(entry.id));
    tdActions.appendChild(deleteBtn);

    tr.appendChild(tdActions);

    entriesBody.appendChild(tr);
  });
}


function render() {
  updateSummary();
  renderList();
}


document.getElementById('entryForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const desc = descriptionEl.value.trim();
  const amt = parseFloat(amountEl.value);
  const type = typeEl.value;

  if (!desc || isNaN(amt) || amt <= 0) {
    alert('Please provide valid description and amount (> 0)');
    return;
  }

  if (editId !== null) {
    
    const idx = entries.findIndex(e => e.id === editId);
    if (idx >= 0) {
      entries[idx].description = desc;
      entries[idx].amount = amt;
      entries[idx].type = type;
    }
    editId = null;
    submitBtn.textContent = 'Add Entry';
  } else {
    
    const newEntry = {
      id: Date.now(),  
      description: desc,
      amount: amt,
      type: type
    };
    entries.push(newEntry);
  }

  saveEntries();
  render();
  this.reset();
});

// Reset button clears form
resetBtn.addEventListener('click', function() {
  document.getElementById('entryForm').reset();
  editId = null;
  submitBtn.textContent = 'Add Entry';
});


function deleteEntry(id) {
  entries = entries.filter(e => e.id !== id);
  saveEntries();
  render();
}


function startEdit(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;

  descriptionEl.value = entry.description;
  amountEl.value = entry.amount;
  typeEl.value = entry.type;
  editId = id;
  submitBtn.textContent = 'Update Entry';
}


for (const f of filterEls) {
  f.addEventListener('change', renderList);
}


init();
