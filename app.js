// ============================================================
//  СПИСОК КНИГ БИБЛИИ (66 книг)
// ============================================================
const BOOKS = [
  {name: "Бытие", chapters: 50, t: "OT"}, {name: "Исход", chapters: 40, t: "OT"}, {name: "Левит", chapters: 27, t: "OT"},
  {name: "Числа", chapters: 36, t: "OT"}, {name: "Второзаконие", chapters: 34, t: "OT"}, {name: "Иисус Навин", chapters: 24, t: "OT"},
  {name: "Судьи", chapters: 21, t: "OT"}, {name: "Руфь", chapters: 4, t: "OT"}, {name: "1 Царств", chapters: 31, t: "OT"},
  {name: "2 Царств", chapters: 24, t: "OT"}, {name: "3 Царств", chapters: 22, t: "OT"}, {name: "4 Царств", chapters: 25, t: "OT"},
  {name: "1 Паралипоменон", chapters: 29, t: "OT"}, {name: "2 Паралипоменон", chapters: 36, t: "OT"}, {name: "Ездра", chapters: 10, t: "OT"},
  {name: "Неемия", chapters: 13, t: "OT"}, {name: "Есфирь", chapters: 10, t: "OT"}, {name: "Иов", chapters: 42, t: "OT"},
  {name: "Псалтирь", chapters: 150, t: "OT"}, {name: "Притчи", chapters: 31, t: "OT"}, {name: "Екклесиаст", chapters: 12, t: "OT"},
  {name: "Песня Песней", chapters: 8, t: "OT"}, {name: "Исаия", chapters: 66, t: "OT"}, {name: "Иеремия", chapters: 52, t: "OT"},
  {name: "Плач Иеремии", chapters: 5, t: "OT"}, {name: "Иезекииль", chapters: 48, t: "OT"}, {name: "Даниил", chapters: 12, t: "OT"},
  {name: "Осия", chapters: 14, t: "OT"}, {name: "Иоиль", chapters: 3, t: "OT"}, {name: "Амос", chapters: 9, t: "OT"},
  {name: "Авдий", chapters: 1, t: "OT"}, {name: "Иона", chapters: 4, t: "OT"}, {name: "Михей", chapters: 7, t: "OT"},
  {name: "Наум", chapters: 3, t: "OT"}, {name: "Аввакум", chapters: 3, t: "OT"}, {name: "Софония", chapters: 3, t: "OT"},
  {name: "Аггей", chapters: 2, t: "OT"}, {name: "Захария", chapters: 14, t: "OT"}, {name: "Малахия", chapters: 4, t: "OT"},
  {name: "От Матфея", chapters: 28, t: "NT"}, {name: "От Марка", chapters: 16, t: "NT"}, {name: "От Луки", chapters: 24, t: "NT"},
  {name: "От Иоанна", chapters: 21, t: "NT"}, {name: "Деяния", chapters: 28, t: "NT"}, {name: "Иакова", chapters: 5, t: "NT"},
  {name: "1 Петра", chapters: 5, t: "NT"}, {name: "2 Петра", chapters: 3, t: "NT"}, {name: "1 Иоанна", chapters: 5, t: "NT"},
  {name: "2 Иоанна", chapters: 1, t: "NT"}, {name: "3 Иоанна", chapters: 1, t: "NT"}, {name: "Иуды", chapters: 1, t: "NT"},
  {name: "Римлянам", chapters: 16, t: "NT"}, {name: "1 Коринфянам", chapters: 16, t: "NT"}, {name: "2 Коринфянам", chapters: 13, t: "NT"},
  {name: "Галатам", chapters: 6, t: "NT"}, {name: "Ефесянам", chapters: 6, t: "NT"}, {name: "Филиппийцам", chapters: 4, t: "NT"},
  {name: "Колоссянам", chapters: 4, t: "NT"}, {name: "1 Фессалоникийцам", chapters: 5, t: "NT"}, {name: "2 Фессалоникийцам", chapters: 3, t: "NT"},
  {name: "1 Тимофею", chapters: 6, t: "NT"}, {name: "2 Тимофею", chapters: 4, t: "NT"}, {name: "Титу", chapters: 3, t: "NT"},
  {name: "Филимону", chapters: 1, t: "NT"}, {name: "Евреям", chapters: 13, t: "NT"}, {name: "Откровение", chapters: 22, t: "NT"}
];

let currentFilter = 'ALL';
let progress = {};
let startDate = null;
let totalDays = 280;
let PERIODS = [];

let syncDebounceTimer = null;
const DEBOUNCE_DELAY = 3000;

let chartVisible = false;
let chartCanvas = null;
let chartCtx = null;

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ
// ============================================================
function init() {
  loadStartDate();
  loadTotalDays();
  loadProgress();
  buildPeriods();
  initPeriodSelector();
  setTestamentFilter('ALL');
  updateStats();
  initSyncForm();
  registerServiceWorker();
  initChart();

  const container = document.getElementById('chart-container');
  if (container) container.style.display = 'none';
  const toggle = document.getElementById('chart-toggle');
  if (toggle) toggle.checked = false;

  setInterval(updateStats, 60000);

  if (localStorage.getItem('gh_token') && localStorage.getItem('gh_gist_id')) {
    pullFromCloud();
  }
}

// ============================================================
//  ДАТА СТАРТА
// ============================================================
function loadStartDate() {
  const saved = localStorage.getItem('bible_start_date');
  if (saved) {
    const d = new Date(saved);
    if (!isNaN(d)) {
      startDate = d;
      document.getElementById('start-date-input').value = saved;
      return;
    }
  }
  startDate = new Date();
  startDate.setHours(0,0,0,0);
  document.getElementById('start-date-input').value = startDate.toISOString().slice(0,10);
}

function saveStartDate() {
  const val = document.getElementById('start-date-input').value;
  if (val) {
    const d = new Date(val);
    if (!isNaN(d)) {
      startDate = d;
      localStorage.setItem('bible_start_date', val);
      buildPeriods();
      initPeriodSelector();
      updateStats();
      if (chartVisible) drawChart();
    }
  }
}

// ============================================================
//  КОЛИЧЕСТВО ДНЕЙ
// ============================================================
function loadTotalDays() {
  const saved = localStorage.getItem('bible_total_days');
  if (saved) {
    const val = parseInt(saved, 10);
    if (!isNaN(val) && val > 0) {
      totalDays = val;
      document.getElementById('total-days-input').value = val;
      return;
    }
  }
  totalDays = 280;
  document.getElementById('total-days-input').value = 280;
}

function saveTotalDays() {
  const val = parseInt(document.getElementById('total-days-input').value, 10);
  if (!isNaN(val) && val > 0) {
    totalDays = val;
    localStorage.setItem('bible_total_days', String(val));
    buildPeriods();
    initPeriodSelector();
    updateStats();
    if (chartVisible) drawChart();
  } else {
    alert('Введите положительное число дней.');
  }
}

function applyPlanSettings() {
  saveStartDate();
  saveTotalDays();
}

// ============================================================
//  ПОСТРОЕНИЕ ПЕРИОДОВ
// ============================================================
function buildPeriods() {
  PERIODS = [];
  if (!startDate || totalDays < 1) return;
  const start = new Date(startDate);
  const totalChapters = 1189;
  const periodDays = 10;
  const numPeriods = Math.ceil(totalDays / periodDays);

  for (let i = 1; i <= numPeriods; i++) {
    const pStart = new Date(start);
    pStart.setDate(start.getDate() + (i - 1) * periodDays);
    const pEnd = new Date(pStart);
    const daysInThisPeriod = Math.min(periodDays, totalDays - (i-1) * periodDays);
    pEnd.setDate(pStart.getDate() + daysInThisPeriod - 1);

    const daysElapsed = i * periodDays;
    const cumulativeDays = Math.min(daysElapsed, totalDays);
    const targetCum = Math.round((cumulativeDays / totalDays) * totalChapters);

    const formatDate = (d) => `${d.getDate()} ${['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'][d.getMonth()]}`;

    PERIODS.push({
      id: i,
      label: `Период ${i} (Дни ${(i-1)*periodDays + 1}–${Math.min(i*periodDays, totalDays)}: ${formatDate(pStart)} – ${formatDate(pEnd)})`,
      target: Math.min(totalChapters, targetCum),
      endDate: pEnd
    });
  }
}

// ============================================================
//  ЗАГРУЗКА / СОХРАНЕНИЕ ПРОГРЕССА
// ============================================================
function loadProgress() {
  try {
    const raw = localStorage.getItem('bible_tracker_280');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        let valid = true;
        for (const key in parsed) {
          if (typeof parsed[key] !== 'string' || isNaN(new Date(parsed[key]))) {
            valid = false;
            break;
          }
        }
        if (valid) {
          progress = parsed;
          return;
        }
      }
    }
  } catch (e) {}
  progress = {};
}

function saveProgress() {
  localStorage.setItem('bible_tracker_280', JSON.stringify(progress));
}

// ============================================================
//  ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================
function getReadCountUpTo(date) {
  const target = new Date(date);
  target.setHours(23,59,59,999);
  let count = 0;
  for (const key in progress) {
    const d = new Date(progress[key]);
    if (d <= target) count++;
  }
  return count;
}

function toggleChapter(key) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const dateStr = today.toISOString().slice(0,10);

  if (progress[key]) {
    delete progress[key];
  } else {
    progress[key] = dateStr;
  }
  saveProgress();
  scheduleSync();
  refreshUI();
}

// ============================================================
//  ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
// ============================================================
function refreshUI() {
  populateBookSelect();
  renderGrid();
  updateStats();
  if (chartVisible) drawChart();
  updatePeriodAlert();
}

function updateStats() {
  const totalRead = Object.keys(progress).length;
  const percent = ((totalRead / 1189) * 100).toFixed(1);

  document.getElementById('stat-chapters').textContent = `${totalRead} / 1189`;
  document.getElementById('stat-percent').textContent = `${percent}%`;
  document.getElementById('stat-remaining').textContent = `${1189 - totalRead}`;
  document.getElementById('progress-fill').style.width = `${percent}%`;

  updatePeriodInfo();
}

function updatePeriodInfo() {
  const periodId = parseInt(document.getElementById('period-select').value) || 1;
  const period = PERIODS.find(p => p.id === periodId);
  if (!period) return;

  const totalRead = Object.keys(progress).length;
  const diff = totalRead - period.target;

  document.getElementById('period-target-val').textContent = `${period.target} глав`;
  document.getElementById('period-actual-val').textContent = `${totalRead} глав`;

  const diffEl = document.getElementById('period-diff-val');
  const badgeEl = document.getElementById('period-badge');

  if (diff >= 0) {
    diffEl.textContent = `+${diff} (Опережение)`;
    diffEl.style.color = '#4ade80';
    badgeEl.className = 'status-badge badge-success';
    badgeEl.textContent = 'В графике';
  } else {
    diffEl.textContent = `${diff} (Отставание)`;
    diffEl.style.color = '#f87171';
    badgeEl.className = 'status-badge badge-danger';
    badgeEl.textContent = 'Отставание';
  }

  renderPeriodTable();
  if (chartVisible) drawChart();
  updatePeriodAlert();
}

function renderPeriodTable() {
  const tbody = document.getElementById('period-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  PERIODS.forEach(p => {
    const tr = document.createElement('tr');
    const readByEnd = getReadCountUpTo(p.endDate);
    const diff = readByEnd - p.target;
    let statusHtml = diff >= 0 
      ? `<span style="color: #4ade80;">+${diff}</span>` 
      : `<span style="color: #f87171;">${diff}</span>`;

    tr.innerHTML = `
      <td><b>№${p.id}</b></td>
      <td>${p.label.split('(')[1].replace(')', '')}</td>
      <td>${p.target}</td>
      <td>${readByEnd}</td>
      <td>${statusHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
//  ФИЛЬТРЫ И СЕЛЕКТЫ
// ============================================================
function setTestamentFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${filter}`).classList.add('active');
  populateBookSelect();
  renderGrid();
}

function populateBookSelect() {
  const select = document.getElementById('book-select');
  const previousValue = select.value;
  select.innerHTML = '';

  BOOKS.forEach((book, globalIdx) => {
    if (currentFilter !== 'ALL' && book.t !== currentFilter) return;

    let readInBook = 0;
    for (let c = 1; c <= book.chapters; c++) {
      if (progress[`${book.name}_${c}`]) readInBook++;
    }
    const isComplete = readInBook === book.chapters;
    const progressLabel = isComplete ? ' ✅' : (readInBook > 0 ? ` (${readInBook}/${book.chapters})` : '');

    const opt = document.createElement('option');
    opt.value = globalIdx;
    opt.textContent = `${book.name}${progressLabel}`;
    select.appendChild(opt);
  });

  if (previousValue !== '' && Array.from(select.options).some(o => o.value === previousValue)) {
    select.value = previousValue;
  }
}

function renderGrid() {
  const select = document.getElementById('book-select');
  if (!select.value && select.value !== '0') return;
  const bookIdx = parseInt(select.value);
  const book = BOOKS[bookIdx];
  if (!book) return;

  const grid = document.getElementById('chapters-grid');
  document.getElementById('book-title').textContent = book.name;

  let readCount = 0;
  const fragment = document.createDocumentFragment();

  for (let c = 1; c <= book.chapters; c++) {
    const key = `${book.name}_${c}`;
    const isRead = !!progress[key];
    if (isRead) readCount++;

    const btn = document.createElement('div');
    btn.className = `chapter-btn ${isRead ? 'read' : ''}`;
    btn.textContent = c;
    btn.onclick = () => toggleChapter(key);
    fragment.appendChild(btn);
  }

  grid.innerHTML = '';
  grid.appendChild(fragment);
  document.getElementById('book-status').textContent = `Прочитано: ${readCount} из ${book.chapters}`;
}

function markAllInBook(status) {
  const bookIdx = document.getElementById('book-select').value;
  const book = BOOKS[bookIdx];
  if (!book) return;

  const today = new Date();
  today.setHours(0,0,0,0);
  const dateStr = today.toISOString().slice(0,10);

  for (let c = 1; c <= book.chapters; c++) {
    const key = `${book.name}_${c}`;
    if (status) {
      if (!progress[key]) progress[key] = dateStr;
    } else {
      delete progress[key];
    }
  }
  saveProgress();
  scheduleSync();
  refreshUI();
}

function resetProgress() {
  if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие необратимо.')) {
    progress = {};
    saveProgress();
    scheduleSync();
    refreshUI();
  }
}

// ============================================================
//  ПЕРИОДЫ
// ============================================================
function initPeriodSelector() {
  const sel = document.getElementById('period-select');
  sel.innerHTML = '';
  PERIODS.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.label;
    sel.appendChild(opt);
  });

  if (startDate && PERIODS.length > 0) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    let activePeriod = Math.min(PERIODS.length, Math.max(1, Math.ceil((diffDays + 1) / 10)));
    sel.value = activePeriod;
  }
}

function togglePeriodTable() {
  const wrapper = document.getElementById('period-table-wrapper');
  const btn = document.getElementById('toggle-table-btn');
  if (wrapper.style.display === 'none') {
    wrapper.style.display = 'block';
    btn.textContent = 'Скрыть таблицу периодов ▼';
  } else {
    wrapper.style.display = 'none';
    btn.textContent = 'Показать все периоды ▲';
  }
}

// ============================================================
//  УПРАВЛЕНИЕ ВИДИМОСТЬЮ ГРАФИКА
// ============================================================
function toggleChartVisibility() {
  const toggle = document.getElementById('chart-toggle');
  const container = document.getElementById('chart-container');
  if (!container) return;
  chartVisible = toggle.checked;
  if (chartVisible) {
    container.style.display = 'block';
    setTimeout(() => {
      resizeChart();
      drawChart();
    }, 50);
  } else {
    container.style.display = 'none';
  }
}

// ============================================================
//  СИНХРОНИЗАЦИЯ С GITHUB
// ============================================================
function scheduleSync() {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => {
    syncToCloud();
  }, DEBOUNCE_DELAY);
}

async function syncToCloud() {
  const token = localStorage.getItem('gh_token');
  const gistId = localStorage.getItem('gh_gist_id');
  const statusEl = document.getElementById('sync-status');
  const spinner = document.getElementById('sync-spinner');

  if (!token || !gistId) return;

  spinner.style.display = 'block';
  statusEl.textContent = '⏳ Сохранение в облако...';
  statusEl.style.color = '#fbbf24';

  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'bible_progress.json': {
            content: JSON.stringify(progress, null, 2)
          },
          'bible_settings.json': {
            content: JSON.stringify({
              startDate: startDate ? startDate.toISOString().slice(0,10) : null,
              totalDays: totalDays
            }, null, 2)
          }
        }
      })
    });

    if (response.ok) {
      statusEl.textContent = '✅ Синхронизировано с GitHub!';
      statusEl.style.color = '#4ade80';
    } else {
      const errText = await response.text();
      throw new Error(`Ошибка ${response.status}: ${errText}`);
    }
  } catch (err) {
    statusEl.textContent = `❌ Ошибка синхронизации: ${err.message}`;
    statusEl.style.color = '#f87171';
  } finally {
    spinner.style.display = 'none';
  }
}

async function pullFromCloud() {
  const token = localStorage.getItem('gh_token');
  const gistId = localStorage.getItem('gh_gist_id');
  const statusEl = document.getElementById('sync-status');
  const spinner = document.getElementById('sync-spinner');

  if (!token || !gistId) return;

  spinner.style.display = 'block';
  statusEl.textContent = '⏳ Загрузка из облака...';

  try {
    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Ошибка ${res.status}: ${errText}`);
    }

    const data = await res.json();
    let updated = false;

    if (data.files['bible_progress.json']) {
      const content = data.files['bible_progress.json'].content;
      const parsed = JSON.parse(content);
      if (typeof parsed === 'object' && parsed !== null) {
        for (const key in parsed) {
          if (typeof parsed[key] === 'string' && !isNaN(new Date(parsed[key]))) {
            progress[key] = parsed[key];
          }
        }
        updated = true;
      }
    }

    if (data.files['bible_settings.json']) {
      const settings = JSON.parse(data.files['bible_settings.json'].content);
      if (settings.startDate) {
        const d = new Date(settings.startDate);
        if (!isNaN(d)) {
          startDate = d;
          localStorage.setItem('bible_start_date', settings.startDate);
          document.getElementById('start-date-input').value = settings.startDate;
        }
      }
      if (settings.totalDays && !isNaN(settings.totalDays) && settings.totalDays > 0) {
        totalDays = settings.totalDays;
        localStorage.setItem('bible_total_days', String(settings.totalDays));
        document.getElementById('total-days-input').value = settings.totalDays;
      }
      updated = true;
    }

    if (updated) {
      buildPeriods();
      initPeriodSelector();
      saveProgress();
      refreshUI();
      statusEl.textContent = '✅ Данные обновлены из облака!';
      statusEl.style.color = '#4ade80';
    } else {
      statusEl.textContent = '⚠️ В облаке нет данных для импорта.';
      statusEl.style.color = '#fbbf24';
    }
  } catch (err) {
    statusEl.textContent = `❌ Ошибка загрузки: ${err.message}`;
    statusEl.style.color = '#f87171';
  } finally {
    spinner.style.display = 'none';
  }
}

// ============================================================
//  НАСТРОЙКИ СИНХРОНИЗАЦИИ
// ============================================================
function initSyncForm() {
  document.getElementById('gh-token').value = localStorage.getItem('gh_token') || '';
  document.getElementById('gh-gist-id').value = localStorage.getItem('gh_gist_id') || '';
  document.getElementById('start-date-input').addEventListener('change', saveStartDate);
}

function toggleSyncPanel() {
  const p = document.getElementById('sync-panel');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
}

function saveSyncSettings() {
  const token = document.getElementById('gh-token').value.trim();
  const gistId = document.getElementById('gh-gist-id').value.trim();
  localStorage.setItem('gh_token', token);
  localStorage.setItem('gh_gist_id', gistId);
  applyPlanSettings();
  scheduleSync();
}

// ============================================================
//  БЭКАП
// ============================================================
function exportBackup() {
  const data = {
    progress: progress,
    startDate: startDate ? startDate.toISOString().slice(0,10) : null,
    totalDays: totalDays
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const a = document.createElement('a');
  a.setAttribute("href", dataStr);
  a.setAttribute("download", `bible_tracker_backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.progress && typeof data.progress === 'object') {
        progress = data.progress;
        saveProgress();
        if (data.startDate) {
          const d = new Date(data.startDate);
          if (!isNaN(d)) {
            startDate = d;
            localStorage.setItem('bible_start_date', data.startDate);
            document.getElementById('start-date-input').value = data.startDate;
          }
        }
        if (data.totalDays && !isNaN(data.totalDays) && data.totalDays > 0) {
          totalDays = data.totalDays;
          localStorage.setItem('bible_total_days', String(data.totalDays));
          document.getElementById('total-days-input').value = data.totalDays;
        }
        buildPeriods();
        initPeriodSelector();
        refreshUI();
        alert('Прогресс успешно импортирован!');
      } else {
        throw new Error('Неверная структура файла');
      }
    } catch (err) {
      alert('Ошибка чтения файла: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ============================================================
//  SERVICE WORKER
// ============================================================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// ============================================================
//  ГРАФИК ПРОГРЕССА
// ============================================================
function initChart() {
  chartCanvas = document.getElementById('progress-chart');
  if (!chartCanvas) return;
  chartCtx = chartCanvas.getContext('2d');
  window.addEventListener('resize', () => {
    if (chartVisible) resizeChart();
  });
}

function resizeChart() {
  if (!chartCanvas) return;
  const container = document.getElementById('chart-container');
  if (!container) return;
  
  const barWidth = 36;
  const gap = 12;
  const padding = { top: 30, bottom: 35, left: 50, right: 20 };
  
  const numPeriods = PERIODS.length || 1;
  const neededWidth = padding.left + padding.right + numPeriods * (barWidth + gap) - gap;
  
  const containerWidth = container.getBoundingClientRect().width;
  let height = Math.min(700, Math.max(400, containerWidth * 0.5));
  if (window.innerWidth < 600) {
    height = Math.min(400, Math.max(300, containerWidth * 0.5));
  }
  
  const dpr = window.devicePixelRatio || 1;
  chartCanvas.width = neededWidth * dpr;
  chartCanvas.height = height * dpr;
  chartCanvas.style.width = neededWidth + 'px';
  chartCanvas.style.height = height + 'px';
  chartCtx.scale(dpr, dpr);
  
  chartCanvas._w = neededWidth;
  chartCanvas._h = height;
  chartCanvas._barWidth = barWidth;
  chartCanvas._gap = gap;
  
  if (chartVisible) drawChart();
}

function drawChart() {
  if (!chartCtx || !chartCanvas || !chartVisible) return;
  const w = chartCanvas._w || 800;
  const h = chartCanvas._h || 400;
  const ctx = chartCtx;

  ctx.clearRect(0, 0, w, h);

  if (PERIODS.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Нет данных для графика', w/2, h/2);
    return;
  }

  const labels = PERIODS.map(p => `№${p.id}`);
  const targets = PERIODS.map(p => p.target);
  const actuals = PERIODS.map(p => getReadCountUpTo(p.endDate));

  const maxVal = Math.max(1189, ...targets, ...actuals) * 1.1;

  const padding = { top: 30, bottom: 35, left: 50, right: 20 };
  const chartH = h - padding.top - padding.bottom;

  const barWidth = chartCanvas._barWidth || 36;
  const gap = chartCanvas._gap || 12;

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, h - padding.bottom);
  ctx.lineTo(w - padding.right, h - padding.bottom);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const val = (i / steps) * maxVal;
    const y = h - padding.bottom - (val / maxVal) * chartH;
    ctx.fillText(Math.round(val), padding.left - 8, y);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(w - padding.right, y);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(14, h/2);
  ctx.rotate(-Math.PI/2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px sans-serif';
  ctx.fillText('Главы', 0, 0);
  ctx.restore();

  const totalPeriods = PERIODS.length;
  for (let i = 0; i < totalPeriods; i++) {
    const x = padding.left + i * (barWidth + gap) + gap/2;
    const targetH = (targets[i] / maxVal) * chartH;
    const actualH = (actuals[i] / maxVal) * chartH;

    ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.fillRect(x, h - padding.bottom - targetH, barWidth, targetH);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, h - padding.bottom - targetH, barWidth, targetH);

    const color = actuals[i] >= targets[i] ? '#4ade80' : '#f87171';
    ctx.fillStyle = color;
    ctx.fillRect(x + 2, h - padding.bottom - actualH, barWidth - 4, actualH);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(labels[i], x + barWidth/2, h - padding.bottom + 4);

    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    if (actuals[i] > 0) {
      ctx.fillStyle = color;
      ctx.fillText(actuals[i], x + barWidth/2, h - padding.bottom - actualH - 2);
    }
    ctx.fillStyle = '#94a3b8';
    ctx.textBaseline = 'top';
    ctx.fillText(targets[i], x + barWidth/2, h - padding.bottom - targetH + 2);
  }

  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Цель (контур)', padding.left, 4);
  ctx.fillStyle = '#4ade80';
  ctx.fillText('Факт (цветной)', padding.left + 80, 4);
  ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
  ctx.fillRect(padding.left + 55, 4, 12, 10);
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(padding.left + 55 + 80, 4, 12, 10);
}

// ============================================================
//  МОДАЛЬНОЕ ОКНО ИНСТРУКЦИИ
// ============================================================
function openHelp() {
  const modal = document.getElementById('help-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeHelp() {
  const modal = document.getElementById('help-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('help-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeHelp();
      }
    });
  }
});

// ============================================================
//  БАННЕР УВЕДОМЛЕНИЯ (с сохранением даты закрытия)
// ============================================================
function closeAlert() {
  const alertEl = document.getElementById('period-alert');
  if (alertEl) {
    alertEl.classList.remove('visible');
    alertEl.style.display = 'none';
    // Запоминаем, что сегодня баннер закрыт
    localStorage.setItem('bible_banner_closed_date', new Date().toDateString());
  }
}

function updatePeriodAlert() {
  const alertEl = document.getElementById('period-alert');
  const alertText = document.getElementById('alert-text');
  if (!alertEl || !alertText) return;

  // Если сегодня баннер уже закрывали – не показываем
  const closedDate = localStorage.getItem('bible_banner_closed_date');
  const today = new Date().toDateString();
  if (closedDate === today) {
    alertEl.classList.remove('visible');
    alertEl.style.display = 'none';
    return;
  }

  const periodId = parseInt(document.getElementById('period-select').value) || 1;
  const period = PERIODS.find(p => p.id === periodId);
  if (!period) {
    alertEl.classList.remove('visible');
    return;
  }

  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);
  const endDate = new Date(period.endDate);
  endDate.setHours(0,0,0,0);

  const diffTime = endDate - todayDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 5 || diffDays < 0) {
    alertEl.classList.remove('visible');
    return;
  }

  let message = '';
  if (diffDays === 0) {
    message = '⚠️ Сегодня последний день периода! Успейте прочитать запланированное.';
  } else if (diffDays === 1) {
    message = '⏳ До окончания периода остался 1 день!';
  } else if (diffDays <= 5) {
    message = `⏳ До окончания периода осталось ${diffDays} дня(ей).`;
  }
  alertText.textContent = message;
  alertEl.classList.add('visible');
}

document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.getElementById('alert-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      const alertEl = document.getElementById('period-alert');
      if (alertEl) alertEl.classList.remove('visible');
    });
  }
});

// ============================================================
//  ЭКСПОРТ ОТЧЁТА (с BOM для корректной кодировки)
// ============================================================
function downloadPeriodReport() {
  const periodId = parseInt(document.getElementById('period-select').value) || 1;
  const period = PERIODS.find(p => p.id === periodId);
  if (!period) {
    alert('Период не найден');
    return;
  }

  const startDate = new Date(period.endDate);
  startDate.setDate(startDate.getDate() - 9);
  startDate.setHours(0,0,0,0);
  const endDate = new Date(period.endDate);
  endDate.setHours(23,59,59,999);

  let readInPeriod = 0;
  for (const key in progress) {
    const d = new Date(progress[key]);
    if (d >= startDate && d <= endDate) {
      readInPeriod++;
    }
  }

  const totalRead = Object.keys(progress).length;

  let otTotal = 0, ntTotal = 0;
  for (const book of BOOKS) {
    if (book.t === 'OT') otTotal += book.chapters;
    else ntTotal += book.chapters;
  }
  let otRead = 0, ntRead = 0;
  for (const key in progress) {
    const bookName = key.split('_').slice(0, -1).join('_');
    const book = BOOKS.find(b => b.name === bookName);
    if (book) {
      if (book.t === 'OT') otRead++;
      else ntRead++;
    }
  }
  const otRemaining = otTotal - otRead;
  const ntRemaining = ntTotal - ntRead;

  const lines = [];
  lines.push('========================================');
  lines.push(`  ОТЧЁТ ПО ПЕРИОДУ №${period.id}`);
  lines.push(`  Даты: ${period.label.split(':')[1].trim()}`);
  lines.push('========================================');
  lines.push('');
  lines.push(`  • Прочитано глав за этот период:   ${readInPeriod}`);
  lines.push(`  • Цель на конец периода:           ${period.target}`);
  lines.push(`  • Всего прочитано глав:            ${totalRead} / 1189`);
  lines.push(`  • Осталось глав:                   ${1189 - totalRead}`);
  lines.push('');
  lines.push('  ── По Заветам ──');
  lines.push(`  • Ветхий Завет: прочитано ${otRead} из ${otTotal}, осталось ${otRemaining}`);
  lines.push(`  • Новый Завет:  прочитано ${ntRead} из ${ntTotal}, осталось ${ntRemaining}`);
  lines.push('');
  lines.push(`  Прогресс выполнения плана: ${((totalRead / 1189) * 100).toFixed(1)}%`);
  lines.push('========================================');
  lines.push(`  Дата формирования: ${new Date().toLocaleString('ru-RU')}`);
  lines.push('========================================');

  const reportText = lines.join('\n');

  // Добавляем BOM (U+FEFF) для правильной кодировки в Windows
  const blob = new Blob(['\uFEFF' + reportText], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Отчёт_период_${period.id}_${new Date().toISOString().slice(0,10)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// ============================================================
//  ЗАПУСК
// ============================================================
init();