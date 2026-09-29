'use strict';

// ---------- Settings ----------
const DAILY_NOTES = 7;          // goal and cap per day
const REVIEW_AFTER_DAYS = 3;    // a forgotten note comes back this many days later
const SPLASH_MS = 3500;         // loading screen before "Touch to continue"
const STORE_KEY = 'retia.v1';

const AI_LINKS = {
  chatgpt: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}`,
  claude: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}`,
};

// Testing helpers: ?reset clears progress, ?today=2026-10-02 pretends it's another day, ?nosplash skips the loading screen
const params = new URLSearchParams(location.search);

// ---------- Saved progress (on this phone only) ----------
function freshState() {
  return { activePack: null, packs: {}, done: {}, days: {}, reviews: {}, settings: { ai: 'chatgpt' } };
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return Object.assign(freshState(), JSON.parse(raw));
  } catch (e) { /* storage unavailable: start fresh */ }
  return freshState();
}
let state = params.has('reset') ? freshState() : loadState();
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}
if (params.has('reset')) save();

// ---------- Dates (local time, YYYY-MM-DD) ----------
function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function toDate(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }
function today() { return params.get('today') || isoDate(new Date()); }
function addDays(iso, n) { const d = toDate(iso); d.setDate(d.getDate() + n); return isoDate(d); }
function daysBetween(a, b) { return Math.round((toDate(b) - toDate(a)) / 86400000); }

function dayRecord(date = today()) {
  if (!state.days[date]) state.days[date] = { read: [], results: {}, sealed: false, recalled: false };
  return state.days[date];
}

// ---------- Packs (Folios) ----------
// Pack format: "# Folio I", then "Subject: theme" lines, "## Day I", "### Subject | Title", then the note text.
function parsePack(file, text) {
  const pack = { file, title: file.replace(/\.md$/, ''), themes: {}, notes: [] };
  let day = '', note = null, inHeader = false, para = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    let m;
    if ((m = line.match(/^#\s+(.+)/))) { pack.title = m[1].trim(); inHeader = true; continue; }
    if ((m = line.match(/^##\s+(.+)/))) { day = m[1].trim().replace(/^Day\s+/i, ''); note = null; inHeader = false; continue; }
    if ((m = line.match(/^###\s+(.+)/))) {
      const heading = m[1];
      const bar = heading.indexOf('|');
      const subject = bar >= 0 ? heading.slice(0, bar).trim() : '';
      const title = (bar >= 0 ? heading.slice(bar + 1) : heading).trim();
      note = { id: `${file}::${title}`, subject, title, day, paras: [] };
      pack.notes.push(note);
      para = null;
      inHeader = false;
      continue;
    }
    if (inHeader && (m = line.match(/^([A-Za-z][\w &-]*):\s*(.+)$/))) { pack.themes[m[1].trim()] = m[2].trim(); continue; }
    if (!note) continue;
    if (!line) { para = null; continue; }
    if (para === null || line.startsWith('**')) { note.paras.push(line); para = note.paras.length - 1; }
    else note.paras[para] += ' ' + line;
  }
  return pack;
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
// Straight quotes look backwards in IM Fell, so use curly ones
function smartQuotes(s) {
  return s
    .replace(/(^|[\s(\[—–-])"/g, '$1“').replace(/"/g, '”')
    .replace(/(^|[\s(\[—–-])'/g, '$1‘').replace(/'/g, '’');
}
function inline(s) {
  return escapeHtml(smartQuotes(s)).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
}
function plainText(s) { return s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1'); }
// Each note is two pages: In short + Explained, then Example + Why it matters
function splitPages(note) {
  const at = note.paras.findIndex((p) => /^\*\*Example/i.test(p));
  if (at > 0) return [note.paras.slice(0, at), note.paras.slice(at)];
  if (note.paras.length < 2) return [note.paras];
  const mid = Math.ceil(note.paras.length / 2);
  return [note.paras.slice(0, mid), note.paras.slice(mid)];
}

// "**In short:** text" becomes a small label on its own line above the text
function renderParas(paras) {
  return paras.map((p) => {
    const m = p.match(/^\*\*([^*]+?):\*\*\s*(.*)$/);
    return m ? `<p><span class="label">${escapeHtml(m[1])}</span>${inline(m[2])}</p>` : `<p>${inline(p)}</p>`;
  }).join('');
}

// On GitHub Pages (username.github.io/repo) the pack list comes from GitHub itself.
function githubRepo() {
  const host = location.hostname;
  if (!host.endsWith('.github.io')) return null;
  const owner = host.split('.')[0];
  const first = location.pathname.split('/').filter(Boolean)[0];
  return { owner, repo: first || host };
}

async function listPackFiles() {
  const gh = githubRepo();
  if (gh) {
    try {
      const res = await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/packs`);
      if (res.ok) {
        const files = (await res.json()).filter((f) => f.type === 'file' && f.name.endsWith('.md')).map((f) => f.name).sort();
        localStorage.setItem(STORE_KEY + '.packlist', JSON.stringify(files));
        return files;
      }
    } catch (e) { /* offline: fall back below */ }
  } else {
    // Local testing: read the dev server's folder listing
    try {
      const res = await fetch('packs/', { cache: 'no-store' });
      if (res.ok) {
        const html = await res.text();
        const files = [...html.matchAll(/href="([^"]+\.md)"/g)].map((m) => decodeURIComponent(m[1].split('/').pop())).sort();
        if (files.length) return files;
      }
    } catch (e) { /* fall back below */ }
  }
  try { return JSON.parse(localStorage.getItem(STORE_KEY + '.packlist')) || []; } catch (e) { return []; }
}

let packs = [];
const noteIndex = new Map(); // id -> { note, pack }

async function loadPacks() {
  const files = await listPackFiles();
  const loaded = [];
  for (const file of files) {
    try {
      const res = await fetch('packs/' + encodeURIComponent(file), { cache: 'no-cache' });
      if (res.ok) loaded.push(parsePack(file, await res.text()));
    } catch (e) { /* skip unreadable pack */ }
  }
  packs = loaded.filter((p) => p.notes.length);
  noteIndex.clear();
  for (const pack of packs) for (const note of pack.notes) noteIndex.set(note.id, { note, pack });
}

function isComplete(pack) { return pack.notes.every((n) => state.done[n.id]); }
function currentPack() {
  let pack = packs.find((p) => p.file === state.activePack);
  if (pack && !isComplete(pack)) return pack;
  pack = packs.find((p) => !isComplete(p)) || null;
  if (pack && state.activePack !== pack.file) { state.activePack = pack.file; save(); }
  return pack;
}
function nextNote(pack) { return pack.notes.find((n) => !state.done[n.id]); }

// ---------- Screens ----------
const $ = (id) => document.getElementById(id);
const screens = ['splash', 'read', 'recall', 'sealed', 'message'];
// The phone's status bar takes this colour: sage on the loading screen, paper inside the app
function show(name) {
  for (const s of screens) $(s).hidden = s !== name;
  document.querySelector('meta[name="theme-color"]').content = name === 'splash' ? '#B3BA93' : '#E6D3AE';
}

let current = null;      // note being read
let browsing = false;    // re-reading today's notes
let recall = null;       // { queue, index }

function route() {
  browsing = false;
  const date = today();
  const rec = dayRecord(date);
  if (rec.sealed) return showSealed(false);

  const pack = currentPack();
  if (rec.read.length < DAILY_NOTES && pack) return showRead(nextNote(pack), pack);

  const queue = recallQueue().filter((id) => !(id in rec.results));
  if (queue.length) return startRecall(queue);
  if (rec.read.length || Object.keys(rec.results).length) { sealDay(); return showSealed(true); }

  if (!packs.length) return showMessage('No Folio yet', 'Add a Folio file to the packs folder, then open Retia again.');
  return showMessage('Every Folio finished', 'You have read every note in every Folio. Add the next Folio to the packs folder.');
}

// ---------- Reading ----------
function arrearsDays(pack, date) {
  const started = state.packs[pack.file]?.startedOn;
  if (!started) return 0;
  const calendarDay = daysBetween(started, date) + 1;
  const doneBefore = pack.notes.filter((n) => state.done[n.id] && state.done[n.id] < date).length;
  const expected = Math.min((calendarDay - 1) * DAILY_NOTES, pack.notes.length);
  return Math.max(0, Math.floor((expected - doneBefore) / DAILY_NOTES));
}

function renderDots(el, count) {
  el.innerHTML = Array.from({ length: DAILY_NOTES }, (_, i) => `<i class="${i < count ? 'on' : ''}"></i>`).join('');
}

function showRead(note, pack, animate = false) {
  current = note;
  const date = today();
  const rec = dayRecord(date);
  if (!browsing) {
    state.packs[pack.file] = state.packs[pack.file] || {};
    if (!state.packs[pack.file].startedOn) { state.packs[pack.file].startedOn = date; save(); }
  }

  $('r-where').textContent = `${pack.title} · Day ${note.day}`;
  $('r-count').textContent = browsing ? 'Revisiting' : `${rec.read.length} / ${DAILY_NOTES}`;
  renderDots($('r-dots'), rec.read.length);

  const behind = browsing ? 0 : arrearsDays(pack, date);
  $('r-arrears').hidden = behind < 1;
  $('r-arrears').textContent = behind === 1 ? '1 day in arrears' : `${behind} days in arrears`;

  const theme = pack.themes[note.subject];
  $('r-subject').textContent = note.subject ? (theme ? `${note.subject} · ${theme}` : note.subject) : '';
  $('r-title').textContent = note.title;
  pages = splitPages(note);
  renderPage(0, animate);
  show('read');
}

let pages = [];
let page = 0;
function renderPage(index, animate) {
  page = index;
  const last = page === pages.length - 1;
  $('r-body').innerHTML = renderParas(pages[page]);
  $('r-pages').hidden = pages.length < 2;
  $('r-pages').innerHTML = pages.map((_, i) => `<span class="${i === page ? 'on' : ''}">${['i', 'ii', 'iii'][i] || i + 1}</span>`).join(' · ');

  const button = $('b-understood');
  button.textContent = !last ? 'Continue' : browsing ? 'Back' : 'Understood';
  button.className = last ? 'primary' : 'next';

  const card = $('r-note');
  card.scrollTop = 0;
  card.classList.remove('out', 'in', 'back');
  if (animate) { void card.offsetWidth; card.classList.add(animate === 'back' ? 'back' : 'in'); }
}

let turning = false;
function turnTo(index) {
  if (turning || index < 0 || index >= pages.length || index === page) return;
  turning = true;
  const card = $('r-note');
  card.classList.remove('in', 'back');
  card.classList.add(index > page ? 'out' : 'out-back');
  setTimeout(() => {
    turning = false;
    card.classList.remove('out', 'out-back');
    renderPage(index, index > page ? true : 'back');
  }, 200);
}

function advance() {
  if (page < pages.length - 1) turnTo(page + 1);
  else understood();
}

function understood() {
  if (turning || !current) return;
  if (browsing) return showRevisitList();
  const date = today();
  const rec = dayRecord(date);
  state.done[current.id] = date;
  if (!rec.read.includes(current.id)) rec.read.push(current.id);
  save();

  turning = true;
  const card = $('r-note');
  card.classList.add('out');
  setTimeout(() => {
    turning = false;
    const pack = currentPack();
    if (rec.read.length < DAILY_NOTES && pack) showRead(nextNote(pack), pack, true);
    else route();
  }, 220);
}

// Swipe left = next page (then Understood), swipe right = previous page
(function setupSwipe() {
  let x0 = null, y0 = null;
  const card = $('r-note');
  card.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  card.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dy) > 50) return;
    if (dx < -70 && !(browsing && page === pages.length - 1)) advance();
    else if (dx > 70) turnTo(page - 1);
  }, { passive: true });
})();

function noteQuery(note) {
  const pack = noteIndex.get(note.id)?.pack;
  const theme = pack?.themes[note.subject];
  const about = [note.subject, theme].filter(Boolean).join(': ');
  const known = note.paras.map(plainText).join(' ');
  return `Explain "${note.title}"${about ? ` (${about})` : ''} in more depth, with real-world examples. Here's what I already know: ${known}`;
}

function lookItUp() {
  if (!current) return;
  const q = [current.title, current.subject].filter(Boolean).join(' ');
  window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank', 'noopener');
}
function askAI() {
  if (!current) return;
  const link = AI_LINKS[state.settings.ai] || AI_LINKS.chatgpt;
  window.open(link(noteQuery(current)), '_blank', 'noopener');
}

// ---------- Recollection ----------
// Today's notes + notes from earlier days that never got recalled + forgotten notes that are due again
function recallQueue() {
  const date = today();
  const ids = new Set();
  for (const [d, rec] of Object.entries(state.days)) {
    if (d <= date && !rec.recalled) rec.read.forEach((id) => ids.add(id));
  }
  for (const [id, due] of Object.entries(state.reviews)) if (due <= date) ids.add(id);
  return [...ids].filter((id) => noteIndex.has(id));
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function startRecall(queue) {
  recall = { queue: shuffle(queue), index: 0 };
  showRecallItem();
}

function showRecallItem() {
  const id = recall.queue[recall.index];
  const { note } = noteIndex.get(id);
  const rec = dayRecord();
  const answered = Object.keys(rec.results).length;
  const total = answered + recall.queue.length - recall.index;
  $('c-count').textContent = `${answered + 1} / ${total}`;
  $('c-title').textContent = `${note.title}?`;
  $('c-hint').textContent = rec.read.includes(id) ? 'think on it first' : 'from an earlier day';
  $('c-subject').textContent = note.subject;
  $('c-body').innerHTML = renderParas(splitPages(note)[0]);
  $('c-answer').hidden = true;
  $('c-answer').scrollTop = 0;
  $('c-judge').hidden = true;
  $('b-see').hidden = false;
  $('recall').classList.remove('revealed');
  show('recall');
}

function seeAnswer() {
  $('recall').classList.add('revealed');
  $('c-answer').hidden = false;
  $('b-see').hidden = true;
  $('c-judge').hidden = false;
}

function judge(remembered) {
  const id = recall.queue[recall.index];
  const date = today();
  dayRecord(date).results[id] = remembered ? 'remembered' : 'forgotten';
  if (remembered) delete state.reviews[id];
  else state.reviews[id] = addDays(date, REVIEW_AFTER_DAYS);
  save();
  recall.index++;
  if (recall.index < recall.queue.length) showRecallItem();
  else { sealDay(); showSealed(true); }
}

// ---------- Sealing the day ----------
function sealDay() {
  const date = today();
  for (const [d, rec] of Object.entries(state.days)) if (d <= date) rec.recalled = true;
  dayRecord(date).sealed = true;
  save();
}

function streak() {
  let date = today();
  if (!dayRecord(date).sealed) date = addDays(date, -1);
  let count = 0;
  while (state.days[date]?.sealed) { count++; date = addDays(date, -1); }
  return count;
}

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
function showSealed(stampNow) {
  const rec = dayRecord();
  const last = rec.read.length ? noteIndex.get(rec.read[rec.read.length - 1]) : null;
  const dayLabel = last ? last.note.day : '';
  $('s-where').textContent = last ? `${last.pack.title} · Day ${dayLabel}` : '';
  $('s-count').textContent = `${rec.read.length} / ${DAILY_NOTES}`;
  $('s-title').textContent = dayLabel ? `Day ${dayLabel} sealed` : 'Day sealed';

  const learned = rec.read.length;
  const remembered = Object.values(rec.results).filter((r) => r === 'remembered').length;
  const learnedText = `${WORDS[learned] || learned} ${learned === 1 ? 'note' : 'notes'} learned`;
  const recalled = Object.keys(rec.results).length;
  $('s-sub').textContent = recalled ? `${learnedText} · ${remembered} of ${recalled} remembered` : learnedText;

  const n = streak();
  $('s-streak').textContent = `Unbroken for ${n} ${n === 1 ? 'day' : 'days'}`;
  $('b-revisit').hidden = !rec.read.length;

  const seal = $('s-seal');
  seal.classList.remove('stamp');
  if (stampNow) { void seal.getBoundingClientRect(); seal.classList.add('stamp'); }
  show('sealed');
}

function showRevisitList() {
  browsing = false;
  const rec = dayRecord();
  const items = rec.read.map((id) => noteIndex.get(id)).filter(Boolean);
  showMessage("Today's notes", '', items.map(({ note }) => ({
    label: note.title,
    sub: note.subject,
    onClick: () => { browsing = true; showRead(note, noteIndex.get(note.id).pack); },
  })), () => route());
}

function showMessage(title, text, items = [], onBack = null) {
  $('m-title').textContent = title;
  $('m-text').textContent = text;
  const list = $('m-list');
  list.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `${escapeHtml(item.label)}${item.sub ? `<small>${escapeHtml(item.sub)}</small>` : ''}`;
    b.addEventListener('click', item.onClick);
    list.appendChild(b);
  }
  $('m-back').hidden = !onBack;
  $('m-back').onclick = onBack;
  show('message');
}

// ---------- Loading screen ----------
async function start() {
  const loading = loadPacks();
  if (params.has('nosplash')) { await loading; return route(); }

  show('splash');
  const splash = $('splash');
  await Promise.all([loading, new Promise((r) => setTimeout(r, SPLASH_MS))]);
  splash.classList.add('ready');
  splash.addEventListener('click', function go() {
    splash.removeEventListener('click', go);
    splash.classList.add('leaving');
    setTimeout(() => { splash.classList.remove('leaving', 'ready'); route(); }, 480);
  });
}

// ---------- Wire up ----------
$('b-understood').addEventListener('click', advance);
$('r-pages').addEventListener('click', (e) => {
  const i = [...$('r-pages').children].indexOf(e.target);
  if (i >= 0) turnTo(i);
});
$('b-lookup').addEventListener('click', lookItUp);
$('b-ask').addEventListener('click', askAI);
$('b-see').addEventListener('click', seeAnswer);
$('b-remembered').addEventListener('click', () => judge(true));
$('b-forgotten').addEventListener('click', () => judge(false));
$('b-revisit').addEventListener('click', showRevisitList);

start();
