const stageLabels = {
  clarifier: "A clarifier",
  relancer: "A relancer",
  en_cours: "En cours",
  bloque: "Bloque",
  fait: "Fait"
};

const stageOrder = ["clarifier", "relancer", "en_cours", "bloque", "fait"];

const routeMeta = {
  dashboard: ["Command center", "Dashboard"],
  pipeline: ["Pipeline", "Suivis par etape"],
  agenda: ["Deadlines", "Agenda"],
  contacts: ["CRM", "Contacts"],
  assistant: ["Kroma OS", "Assistant"],
  brand: ["Direction artistique", "DA Kroma"]
};

const routeAliases = {
  crm: "contacts",
  kroma: "assistant",
  os: "assistant",
  da: "brand"
};

function normalizeRoute(route) {
  if (routeMeta[route]) return route;
  if (routeAliases[route]) return routeAliases[route];
  return "dashboard";
}

const state = {
  contacts: [],
  stages: stageOrder,
  route: normalizeRoute(location.hash.slice(1)),
  selectedId: null,
  query: "",
  stageFilter: "all"
};

const els = {
  routeKicker: document.querySelector("#routeKicker"),
  routeTitle: document.querySelector("#routeTitle"),
  navItems: document.querySelectorAll(".nav-item"),
  views: document.querySelectorAll(".view"),
  navTotal: document.querySelector("#navTotal"),
  navActive: document.querySelector("#navActive"),
  navDue: document.querySelector("#navDue"),
  navDone: document.querySelector("#navDone"),
  metricGrid: document.querySelector("#metricGrid"),
  focusPanel: document.querySelector("#focusPanel"),
  nextPanel: document.querySelector("#nextPanel"),
  briefPanel: document.querySelector("#briefPanel"),
  pipelineBoard: document.querySelector("#pipelineBoard"),
  agendaSummary: document.querySelector("#agendaSummary"),
  agendaGrid: document.querySelector("#agendaGrid"),
  searchInput: document.querySelector("#searchInput"),
  stageTabs: document.querySelector("#stageTabs"),
  listTitle: document.querySelector("#listTitle"),
  contactList: document.querySelector("#contactList"),
  detailPanel: document.querySelector("#detailPanel"),
  commandForm: document.querySelector("#commandForm"),
  commandInput: document.querySelector("#commandInput"),
  commandOutput: document.querySelector("#commandOutput"),
  assistantBrief: document.querySelector("#assistantBrief"),
  assistantNext: document.querySelector("#assistantNext"),
  quickAddBtn: document.querySelector("#quickAddBtn"),
  pipelineAddBtn: document.querySelector("#pipelineAddBtn"),
  contactAddBtn: document.querySelector("#contactAddBtn"),
  dialog: document.querySelector("#contactDialog"),
  form: document.querySelector("#contactForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  closeDialogBtn: document.querySelector("#closeDialogBtn"),
  cancelDialogBtn: document.querySelector("#cancelDialogBtn"),
  contactId: document.querySelector("#contactId"),
  nameInput: document.querySelector("#nameInput"),
  companyInput: document.querySelector("#companyInput"),
  emailInput: document.querySelector("#emailInput"),
  phoneInput: document.querySelector("#phoneInput"),
  stageInput: document.querySelector("#stageInput"),
  valueInput: document.querySelector("#valueInput"),
  nextActionInput: document.querySelector("#nextActionInput"),
  nextActionDateInput: document.querySelector("#nextActionDateInput"),
  ownerInput: document.querySelector("#ownerInput"),
  sourceInput: document.querySelector("#sourceInput"),
  projectTypeInput: document.querySelector("#projectTypeInput"),
  sensitivityInput: document.querySelector("#sensitivityInput"),
  messageDraftInput: document.querySelector("#messageDraftInput")
};

const currency = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
});

const fullDate = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "2-digit",
  month: "short"
});

const shortDate = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short"
});

const agendaStart = new Date("2026-06-29T00:00:00");
const agendaDays = Array.from({ length: 7 }, (_, index) => {
  const date = new Date(agendaStart);
  date.setDate(agendaStart.getDate() + index);
  return date;
});

const mindset = {
  "2026-06-29": "Clarifier avant d'accelerer.",
  "2026-06-30": "Un call prepare vaut deux relances.",
  "2026-07-01": "Verifier date, lieu, responsable.",
  "2026-07-02": "Fermer les petits sujets libere le mental.",
  "2026-07-03": "Avancer vite, relancer propre.",
  "2026-07-04": "Rendre le travail visible.",
  "2026-07-05": "Review, preuve, prochain levier."
};

function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isDone(contact) {
  return contact.stage === "fait" || contact.stage === "client";
}

function dueMeta(contact) {
  if (isDone(contact)) return { label: "Fait", tone: "done", days: 999 };
  if (!contact.nextActionDate) return { label: "Sans date", tone: "empty", days: 999 };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${contact.nextActionDate}T00:00:00`);
  const days = Math.round((due - today) / 86400000);
  if (days < 0) return { label: "En retard", tone: "urgent", days };
  if (days === 0) return { label: "Aujourd'hui", tone: "urgent", days };
  if (days === 1) return { label: "Demain", tone: "soon", days };
  if (days <= 7) return { label: `${days} jours`, tone: "soon", days };
  return { label: shortDate.format(due), tone: "later", days };
}

function rankedContacts(contacts = state.contacts) {
  return [...contacts].sort((a, b) => {
    const dueA = a.nextActionDate || "9999-12-31";
    const dueB = b.nextActionDate || "9999-12-31";
    if (dueA !== dueB) return dueA.localeCompare(dueB);
    return (stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage)) || a.name.localeCompare(b.name);
  });
}

function activeContacts() {
  return state.contacts.filter((contact) => !isDone(contact));
}

function dueContacts() {
  return rankedContacts(activeContacts().filter((contact) => ["urgent", "soon"].includes(dueMeta(contact).tone)));
}

function weekContacts() {
  const start = isoDate(agendaDays[0]);
  const end = isoDate(agendaDays[agendaDays.length - 1]);
  return rankedContacts(activeContacts().filter((contact) => contact.nextActionDate >= start && contact.nextActionDate <= end));
}

function contactLine(contact) {
  const due = dueMeta(contact);
  return `${contact.name} - ${due.label} - ${contact.nextAction || "Action a definir"}`;
}

const staticStorageKey = "kroma-crm-static-contacts-v1";

function getBody(options = {}) {
  if (!options.body) return {};
  try {
    return JSON.parse(options.body);
  } catch {
    return {};
  }
}

function makeId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `contact-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function sanitizeStaticContact(input, existing = {}) {
  const now = new Date().toISOString();
  const name = String(input.name || existing.name || "").trim();
  if (!name) throw new Error("Le nom est obligatoire.");

  const stage = stageOrder.includes(input.stage) ? input.stage : existing.stage || "clarifier";
  return {
    id: existing.id || makeId(),
    name,
    company: String(input.company ?? existing.company ?? "").trim(),
    email: String(input.email ?? existing.email ?? "").trim(),
    phone: String(input.phone ?? existing.phone ?? "").trim(),
    stage,
    value: Number(input.value ?? existing.value ?? 0) || 0,
    nextAction: String(input.nextAction ?? existing.nextAction ?? "").trim(),
    nextActionDate: String(input.nextActionDate ?? existing.nextActionDate ?? "").trim(),
    owner: String(input.owner ?? existing.owner ?? "Kroma").trim(),
    source: String(input.source ?? existing.source ?? "Demo GitHub Pages").trim(),
    projectType: String(input.projectType ?? existing.projectType ?? "").trim(),
    sensitivity: String(input.sensitivity ?? existing.sensitivity ?? "").trim(),
    messageDraft: String(input.messageDraft ?? existing.messageDraft ?? "").trim(),
    notes: Array.isArray(existing.notes) ? existing.notes : [],
    createdAt: existing.createdAt || now,
    updatedAt: now
  };
}

async function readStaticContacts() {
  const saved = localStorage.getItem(staticStorageKey);
  if (saved) return JSON.parse(saved);

  const response = await fetch("data/contacts.json", { cache: "no-store" });
  const payload = await response.json();
  const contacts = Array.isArray(payload.contacts) ? payload.contacts : payload;
  localStorage.setItem(staticStorageKey, JSON.stringify(contacts));
  return contacts;
}

function writeStaticContacts(contacts) {
  localStorage.setItem(staticStorageKey, JSON.stringify(contacts));
}

async function staticApi(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const contacts = await readStaticContacts();
  const contactMatch = path.match(/^\/api\/contacts\/([^/]+)$/);
  const notesMatch = path.match(/^\/api\/contacts\/([^/]+)\/notes$/);

  if (method === "GET" && path === "/api/contacts") {
    return { contacts: rankedContacts(contacts), stages: stageOrder, mode: "static" };
  }

  if (method === "POST" && path === "/api/contacts") {
    const contact = sanitizeStaticContact(getBody(options));
    contacts.push(contact);
    writeStaticContacts(contacts);
    return { contact };
  }

  if (contactMatch && method === "PUT") {
    const id = decodeURIComponent(contactMatch[1]);
    const index = contacts.findIndex((contact) => contact.id === id);
    if (index === -1) throw new Error("Contact introuvable.");
    contacts[index] = sanitizeStaticContact(getBody(options), contacts[index]);
    writeStaticContacts(contacts);
    return { contact: contacts[index] };
  }

  if (contactMatch && method === "DELETE") {
    const id = decodeURIComponent(contactMatch[1]);
    const nextContacts = contacts.filter((contact) => contact.id !== id);
    if (nextContacts.length === contacts.length) throw new Error("Contact introuvable.");
    writeStaticContacts(nextContacts);
    return { ok: true };
  }

  if (notesMatch && method === "POST") {
    const id = decodeURIComponent(notesMatch[1]);
    const index = contacts.findIndex((contact) => contact.id === id);
    if (index === -1) throw new Error("Contact introuvable.");
    const text = String(getBody(options).text || "").trim();
    if (!text) throw new Error("La note est vide.");
    const note = { id: makeId(), text, createdAt: new Date().toISOString() };
    contacts[index].notes = [...(contacts[index].notes || []), note];
    contacts[index].updatedAt = new Date().toISOString();
    writeStaticContacts(contacts);
    return { note, contact: contacts[index] };
  }

  throw new Error("Action CRM indisponible.");
}

async function api(path, options = {}) {
  try {
    const response = await fetch(path, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    const isJson = response.headers.get("content-type")?.includes("application/json");
    if (!isJson && path.startsWith("/api/contacts")) return staticApi(path, options);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Erreur CRM.");
    return payload;
  } catch (error) {
    if (path.startsWith("/api/contacts") && (error.name === "TypeError" || error instanceof SyntaxError)) {
      return staticApi(path, options);
    }
    throw error;
  }
}

async function loadContacts() {
  const payload = await api("/api/contacts");
  state.contacts = payload.contacts;
  state.stages = payload.stages || stageOrder;
  if (!state.selectedId && state.contacts.length) state.selectedId = rankedContacts()[0].id;
  render();
}

function setRoute(route, options = {}) {
  state.route = normalizeRoute(route);
  if (options.hash !== false) history.replaceState(null, "", `#${state.route}`);
  renderShell();
  if (options.scroll !== false) window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderShell() {
  const [kicker, title] = routeMeta[state.route];
  els.routeKicker.textContent = kicker;
  els.routeTitle.textContent = title;
  els.navItems.forEach((item) => item.classList.toggle("active", item.dataset.route === state.route));
  els.views.forEach((view) => view.classList.toggle("active", view.dataset.view === state.route));
}

function renderMetrics() {
  const active = activeContacts();
  const due = dueContacts();
  const done = state.contacts.filter(isDone);
  const pipeline = active.reduce((sum, contact) => sum + Number(contact.value || 0), 0);
  const win = state.contacts.length ? Math.round((done.length / state.contacts.length) * 100) : 0;

  els.navTotal.textContent = state.contacts.length;
  els.navActive.textContent = active.length;
  els.navDue.textContent = due.length;
  els.navDone.textContent = done.length;

  const metrics = [
    ["Pipeline actif", currency.format(pipeline), `${active.length} sujets ouverts`],
    ["Relances", due.length, "Aujourd'hui + 7 jours"],
    ["Conversion", `${win}%`, `${done.length} termines`],
    ["Semaine", weekContacts().length, "deadlines actives"]
  ];
  els.metricGrid.innerHTML = metrics
    .map(([label, value, detail]) => `
      <article class="metric">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(detail)}</small>
      </article>
    `)
    .join("");
}

function selectContact(id, route = "contacts") {
  state.selectedId = id;
  setRoute(route);
  render();
}

function renderDashboard() {
  const due = dueContacts();
  const next = due[0] || rankedContacts(activeContacts())[0];
  const week = weekContacts();

  els.focusPanel.innerHTML = `
    <div class="panel-header">
      <div>
        <p class="eyebrow">Focus</p>
        <h2>Prochain move</h2>
      </div>
      ${next ? `<span class="due-pill ${dueMeta(next).tone}">${escapeHtml(dueMeta(next).label)}</span>` : ""}
    </div>
    ${
      next
        ? `<button class="focus-item" type="button" data-contact="${escapeHtml(next.id)}">
            <strong>${escapeHtml(next.name)}</strong>
            <span>${escapeHtml(next.nextAction || "Action a definir")}</span>
          </button>`
        : `<div class="empty-state">Aucun sujet actif.</div>`
    }
  `;

  els.nextPanel.innerHTML = `
    <div class="panel-header">
      <div>
        <p class="eyebrow">Urgent</p>
        <h2>Relances</h2>
      </div>
      <button class="ghost-button compact" type="button" data-route-target="contacts">Voir CRM</button>
    </div>
    <div class="mini-list">
      ${
        due.slice(0, 4).map((contact) => `
          <button class="mini-item" type="button" data-contact="${escapeHtml(contact.id)}">
            <strong>${escapeHtml(contact.name)}</strong>
            <span>${escapeHtml(contactLine(contact))}</span>
          </button>
        `).join("") || `<div class="empty-state">Aucune relance proche.</div>`
      }
    </div>
  `;

  els.briefPanel.innerHTML = `
    <div class="panel-header">
      <div>
        <p class="eyebrow">Brief</p>
        <h2>Semaine Viral Media</h2>
      </div>
      <button class="ghost-button compact" type="button" data-route-target="agenda">Agenda</button>
    </div>
    <div class="mini-list">
      ${
        week.slice(0, 5).map((contact) => `
          <button class="mini-item" type="button" data-contact="${escapeHtml(contact.id)}">
            <strong>${escapeHtml(contact.name)}</strong>
            <span>${escapeHtml(contact.nextAction || "Action a definir")}</span>
          </button>
        `).join("") || `<div class="empty-state">Aucune deadline cette semaine.</div>`
      }
    </div>
  `;
}

function renderPipeline() {
  els.pipelineBoard.innerHTML = state.stages.map((stage) => {
    const contacts = rankedContacts(state.contacts.filter((contact) => contact.stage === stage));
    return `
      <section class="pipeline-column">
        <header>
          <h3>${escapeHtml(stageLabels[stage] || stage)}</h3>
          <span class="stage-pill ${escapeHtml(stage)}">${contacts.length}</span>
        </header>
        <div class="pipeline-list">
          ${
            contacts.map((contact) => `
              <button class="pipeline-card" type="button" data-contact="${escapeHtml(contact.id)}">
                <strong>${escapeHtml(contact.name)}</strong>
                <small>${escapeHtml(contact.nextAction || contact.sensitivity || "Aucune action")}</small>
                <span class="due-pill ${dueMeta(contact).tone}">${escapeHtml(dueMeta(contact).label)}</span>
              </button>
            `).join("") || `<p class="agenda-empty">Vide</p>`
          }
        </div>
      </section>
    `;
  }).join("");
}

function renderAgenda() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const week = weekContacts();
  const urgent = dueContacts().filter((contact) => dueMeta(contact).tone === "urgent").length;
  els.agendaSummary.textContent = `${week.length} deadlines cette semaine - ${urgent} urgentes`;

  els.agendaGrid.innerHTML = agendaDays.map((day) => {
    const dayIso = isoDate(day);
    const contacts = week.filter((contact) => contact.nextActionDate === dayIso);
    const isToday = isoDate(today) === dayIso;
    return `
      <article class="agenda-day ${isToday ? "today" : ""}">
        <div class="agenda-day-header">
          <span>${escapeHtml(fullDate.format(day))}</span>
          <strong>${escapeHtml(shortDate.format(day))}</strong>
        </div>
        <div class="agenda-items">
          ${
            contacts.map((contact) => `
              <button class="mini-item" type="button" data-contact="${escapeHtml(contact.id)}">
                <strong>${escapeHtml(contact.name)}</strong>
                <span>${escapeHtml(contact.nextAction || "Action a definir")}</span>
              </button>
            `).join("") || `<p class="agenda-empty">Libre</p>`
          }
        </div>
        <div class="mindset">${escapeHtml(mindset[dayIso] || "")}</div>
      </article>
    `;
  }).join("");
}

function filteredContacts() {
  const query = state.query.trim().toLowerCase();
  return rankedContacts(state.contacts.filter((contact) => {
    const haystack = [
      contact.name,
      contact.company,
      contact.email,
      contact.phone,
      contact.source,
      contact.projectType,
      contact.sensitivity,
      contact.nextAction,
      contact.messageDraft
    ].join(" ").toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesStage = state.stageFilter === "all" || contact.stage === state.stageFilter;
    return matchesQuery && matchesStage;
  }));
}

function renderStageTabs() {
  const tabs = [{ value: "all", label: "Tous" }, ...state.stages.map((stage) => ({ value: stage, label: stageLabels[stage] || stage }))];
  els.stageTabs.innerHTML = tabs.map((tab) => `
    <button class="stage-tab ${state.stageFilter === tab.value ? "active" : ""}" type="button" data-stage="${escapeHtml(tab.value)}">
      ${escapeHtml(tab.label)}
    </button>
  `).join("");
  const current = tabs.find((tab) => tab.value === state.stageFilter);
  els.listTitle.textContent = current?.label || "Tous les suivis";
}

function renderContactList() {
  const contacts = filteredContacts();
  els.contactList.innerHTML = contacts.map((contact) => `
    <button class="contact-card ${contact.id === state.selectedId ? "active" : ""}" type="button" data-contact="${escapeHtml(contact.id)}">
      <span>
        <strong>${escapeHtml(contact.name)}</strong>
        <small>${escapeHtml(contact.company)}</small>
        <small>${escapeHtml(contact.nextAction || contact.sensitivity || "Aucune action")}</small>
      </span>
      <span class="contact-card-meta">
        <span class="badge ${escapeHtml(contact.stage)}">${escapeHtml(stageLabels[contact.stage] || contact.stage)}</span>
        <span class="due-pill ${dueMeta(contact).tone}">${escapeHtml(dueMeta(contact).label)}</span>
      </span>
    </button>
  `).join("") || `<div class="empty-state">Aucun suivi trouve.</div>`;
}

function renderDetail() {
  const contact = state.contacts.find((item) => item.id === state.selectedId);
  if (!contact) {
    els.detailPanel.innerHTML = `<div class="empty-state">Selectionne un suivi.</div>`;
    return;
  }
  const due = dueMeta(contact);
  const notes = contact.notes?.length
    ? contact.notes.map((note) => `
        <article class="note">
          <p>${escapeHtml(note.text)}</p>
          <time>${new Date(note.createdAt).toLocaleString("fr-FR")}</time>
        </article>
      `).join("")
    : `<p class="agenda-empty">Aucune note.</p>`;
  els.detailPanel.innerHTML = `
    <div class="detail-header">
      <span class="badge ${escapeHtml(contact.stage)}">${escapeHtml(stageLabels[contact.stage] || contact.stage)}</span>
      <h2>${escapeHtml(contact.name)}</h2>
      <p>${escapeHtml(contact.company)}</p>
      <div class="detail-actions">
        <button class="ghost-button compact" type="button" data-action="edit">Modifier</button>
        <button class="danger-button compact" type="button" data-action="delete">Supprimer</button>
      </div>
    </div>
    <div class="detail-body">
      <div class="info-tile wide">
        <span>Prochaine action</span>
        <strong>${escapeHtml(contact.nextAction || "Action a definir")}</strong>
      </div>
      <div class="detail-grid">
        <div class="info-tile"><span>Relance</span><strong>${escapeHtml(due.label)}</strong></div>
        <div class="info-tile"><span>Enjeu</span><strong>${currency.format(contact.value || 0)}</strong></div>
        <div class="info-tile"><span>Responsable</span><strong>${escapeHtml(contact.owner || "Mathis")}</strong></div>
        <div class="info-tile"><span>Type</span><strong>${escapeHtml(contact.projectType || "Suivi")}</strong></div>
        <div class="info-tile wide"><span>Point sensible</span><strong>${escapeHtml(contact.sensitivity || "Aucun point sensible")}</strong></div>
        <div class="info-tile wide"><span>Source</span><strong>${escapeHtml(contact.source || "Non renseignee")}</strong></div>
      </div>
      ${
        contact.messageDraft
          ? `<section class="message-box">
              <div class="panel-header">
                <div><p class="eyebrow">Message</p><h2>Relance prete</h2></div>
                <button class="ghost-button compact" type="button" data-action="copy">Copier</button>
              </div>
              <pre>${escapeHtml(contact.messageDraft)}</pre>
            </section>`
          : ""
      }
      <form class="note-form" data-action="note">
        <textarea name="note" rows="3" placeholder="Ajouter une note..."></textarea>
        <button class="primary-button" type="submit">Ajouter la note</button>
      </form>
      <div class="note-list">${notes}</div>
    </div>
  `;
}

function renderAssistant() {
  const due = dueContacts();
  const week = weekContacts();
  const next = due[0] || week[0] || rankedContacts(activeContacts())[0];
  els.assistantBrief.innerHTML = `
    <div class="mini-item"><strong>${activeContacts().length} sujets actifs</strong><span>${due.length} relances a surveiller</span></div>
    <div class="mini-item"><strong>${week.length} deadlines semaine</strong><span>${week.slice(0, 3).map((contact) => contact.name).join(" / ") || "RAS"}</span></div>
  `;
  els.assistantNext.innerHTML = next
    ? `<button class="focus-item" type="button" data-contact="${escapeHtml(next.id)}"><strong>${escapeHtml(next.name)}</strong><span>${escapeHtml(next.nextAction || "Action a definir")}</span></button>`
    : `<div class="empty-state">Aucun next move.</div>`;
}

function render() {
  renderShell();
  renderMetrics();
  renderDashboard();
  renderPipeline();
  renderAgenda();
  renderStageTabs();
  renderContactList();
  renderDetail();
  renderAssistant();
}

function commandOutput(message) {
  els.commandOutput.textContent = message;
}

function runCommand(raw) {
  const command = raw.trim();
  if (!command) {
    commandOutput("Systeme pret. Priorites chargees.");
    return;
  }
  const normalized = command.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (normalized.includes("nouveau")) {
    setRoute("contacts");
    openDialog();
    commandOutput("Creation d'un nouveau suivi.");
    return;
  }
  if (normalized.includes("agenda") || normalized.includes("deadline")) {
    setRoute("agenda");
    commandOutput(`Agenda ouvert: ${weekContacts().length} deadlines cette semaine.`);
    return;
  }
  if (normalized.includes("pipeline")) {
    setRoute("pipeline");
    commandOutput("Pipeline ouvert.");
    return;
  }
  if (normalized.includes("relance")) {
    state.stageFilter = "all";
    state.query = "";
    setRoute("contacts");
    commandOutput(dueContacts().slice(0, 4).map(contactLine).join(" | ") || "Aucune relance proche.");
    return;
  }
  if (normalized.includes("focus") || normalized.includes("brief")) {
    setRoute("dashboard");
    const next = dueContacts()[0] || rankedContacts(activeContacts())[0];
    commandOutput(next ? `Focus: ${contactLine(next)}` : "Aucun sujet actif.");
    return;
  }
  if (normalized.includes("da") || normalized.includes("brand")) {
    setRoute("brand");
    commandOutput("DA ouverte.");
    return;
  }
  const search = normalized.replace(/^cherche\s+|^recherche\s+|^trouve\s+/, "").trim() || command;
  state.query = search;
  state.stageFilter = "all";
  els.searchInput.value = search;
  setRoute("contacts");
  render();
  commandOutput(`${filteredContacts().length} resultat(s) pour "${search}".`);
}

function fillStageSelect() {
  els.stageInput.innerHTML = state.stages.map((stage) => `
    <option value="${escapeHtml(stage)}">${escapeHtml(stageLabels[stage] || stage)}</option>
  `).join("");
}

function openDialog(contact = null) {
  fillStageSelect();
  els.form.reset();
  els.contactId.value = contact?.id || "";
  els.dialogTitle.textContent = contact ? "Modifier le suivi" : "Nouveau suivi";
  els.nameInput.value = contact?.name || "";
  els.companyInput.value = contact?.company || "";
  els.emailInput.value = contact?.email || "";
  els.phoneInput.value = contact?.phone || "";
  els.stageInput.value = contact?.stage || "clarifier";
  els.valueInput.value = contact?.value || "";
  els.nextActionInput.value = contact?.nextAction || "";
  els.nextActionDateInput.value = contact?.nextActionDate || "";
  els.ownerInput.value = contact?.owner || "Mathis";
  els.sourceInput.value = contact?.source || "";
  els.projectTypeInput.value = contact?.projectType || "";
  els.sensitivityInput.value = contact?.sensitivity || "";
  els.messageDraftInput.value = contact?.messageDraft || "";
  els.dialog.showModal();
}

function closeDialog() {
  els.dialog.close();
}

function formPayload() {
  return {
    name: els.nameInput.value,
    company: els.companyInput.value,
    email: els.emailInput.value,
    phone: els.phoneInput.value,
    stage: els.stageInput.value,
    value: Number(els.valueInput.value || 0),
    nextAction: els.nextActionInput.value,
    nextActionDate: els.nextActionDateInput.value,
    owner: els.ownerInput.value,
    source: els.sourceInput.value,
    projectType: els.projectTypeInput.value,
    sensitivity: els.sensitivityInput.value,
    messageDraft: els.messageDraftInput.value
  };
}

async function saveContact(event) {
  event.preventDefault();
  const id = els.contactId.value;
  const endpoint = id ? `/api/contacts/${encodeURIComponent(id)}` : "/api/contacts";
  const method = id ? "PUT" : "POST";
  try {
    const result = await api(endpoint, { method, body: JSON.stringify(formPayload()) });
    state.selectedId = result.contact.id;
    closeDialog();
    await loadContacts();
    toast(id ? "Suivi mis a jour" : "Suivi ajoute");
  } catch (error) {
    toast(error.message);
  }
}

async function deleteContact(contact) {
  if (!confirm(`Supprimer ${contact.name} ?`)) return;
  try {
    await api(`/api/contacts/${encodeURIComponent(contact.id)}`, { method: "DELETE" });
    state.selectedId = null;
    await loadContacts();
    toast("Suivi supprime");
  } catch (error) {
    toast(error.message);
  }
}

async function addNote(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const text = form.elements.note.value.trim();
  if (!text || !state.selectedId) return;
  try {
    await api(`/api/contacts/${encodeURIComponent(state.selectedId)}/notes`, {
      method: "POST",
      body: JSON.stringify({ text })
    });
    form.reset();
    await loadContacts();
    toast("Note ajoutee");
  } catch (error) {
    toast(error.message);
  }
}

async function copyMessage(contact) {
  try {
    await navigator.clipboard.writeText(contact.messageDraft || "");
    toast("Message copie");
  } catch {
    toast("Copie impossible");
  }
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.append(node);
  setTimeout(() => node.remove(), 2500);
}

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) setRoute(routeButton.dataset.route);

  const routeTarget = event.target.closest("[data-route-target]");
  if (routeTarget) setRoute(routeTarget.dataset.routeTarget);

  const commandButton = event.target.closest("[data-command]");
  if (commandButton) {
    els.commandInput.value = commandButton.dataset.command;
    runCommand(commandButton.dataset.command);
  }

  const contactButton = event.target.closest("[data-contact]");
  if (contactButton) selectContact(contactButton.dataset.contact);

  const stageButton = event.target.closest("[data-stage]");
  if (stageButton) {
    state.stageFilter = stageButton.dataset.stage;
    render();
  }

  const actionButton = event.target.closest("[data-action]");
  const current = state.contacts.find((contact) => contact.id === state.selectedId);
  if (!actionButton || !current) return;
  if (actionButton.dataset.action === "edit") openDialog(current);
  if (actionButton.dataset.action === "delete") deleteContact(current);
  if (actionButton.dataset.action === "copy") copyMessage(current);
});

els.commandForm.addEventListener("submit", (event) => {
  event.preventDefault();
  runCommand(els.commandInput.value);
});

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

document.addEventListener("submit", (event) => {
  if (event.target.matches('[data-action="note"]')) addNote(event);
});

[els.quickAddBtn, els.pipelineAddBtn, els.contactAddBtn].forEach((button) => {
  button?.addEventListener("click", () => {
    setRoute("contacts");
    openDialog();
  });
});

els.closeDialogBtn.addEventListener("click", closeDialog);
els.cancelDialogBtn.addEventListener("click", closeDialog);
els.form.addEventListener("submit", saveContact);

window.addEventListener("hashchange", () => {
  const route = normalizeRoute(location.hash.slice(1));
  state.route = route;
  history.replaceState(null, "", `#${route}`);
  render();
});

if (location.hash.slice(1) !== state.route) {
  history.replaceState(null, "", `#${state.route}`);
}

loadContacts().catch((error) => {
  els.commandOutput.textContent = error.message;
});
