const stageLabels = {
  clarifier: "A décoder",
  relancer: "Signal chaud",
  en_cours: "En action",
  bloque: "Blocage",
  fait: "Bouclé"
};

const stageOrder = ["clarifier", "relancer", "en_cours", "bloque", "fait"];

const routeMeta = {
  dashboard: ["HQ multivers", "Radar Kroma"],
  pipeline: ["Missions", "Board street"],
  agenda: ["Tempo", "Agenda des impacts"],
  contacts: ["Dossiers", "Deck missions"],
  database: ["Automation mail", "Base missions"],
  assistant: ["Jarvis layer", "Agent tactique"],
  brand: ["Direction artistique", "Street-Verse"],
  profile: ["Session utilisateur", "Profil"]
};

const routeAliases = {
  crm: "contacts",
  base: "database",
  mail: "database",
  kroma: "assistant",
  os: "assistant",
  da: "brand",
  profil: "profile"
};

function normalizeRoute(route) {
  if (routeMeta[route]) return route;
  if (routeAliases[route]) return routeAliases[route];
  return "dashboard";
}

const state = {
  contacts: [],
  mailDb: null,
  session: null,
  stages: stageOrder,
  route: normalizeRoute(location.hash.slice(1)),
  selectedId: null,
  query: "",
  stageFilter: "all",
  agentOpen: false,
  agentMessages: []
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
  navMail: document.querySelector("#navMail"),
  navProfile: document.querySelector("#navProfile"),
  brandName: document.querySelector("#brandName"),
  brandTagline: document.querySelector("#brandTagline"),
  weekLabel: document.querySelector("#weekLabel"),
  commandLabel: document.querySelector("#commandLabel"),
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
  mailDbSummary: document.querySelector("#mailDbSummary"),
  mailDbImports: document.querySelector("#mailDbImports"),
  mailDbShoots: document.querySelector("#mailDbShoots"),
  mailDbTasks: document.querySelector("#mailDbTasks"),
  profilePreview: document.querySelector("#profilePreview"),
  profileForm: document.querySelector("#profileForm"),
  profileNameInput: document.querySelector("#profileNameInput"),
  profileHandleInput: document.querySelector("#profileHandleInput"),
  profileRoleInput: document.querySelector("#profileRoleInput"),
  profileEmailInput: document.querySelector("#profileEmailInput"),
  profileAvatarInput: document.querySelector("#profileAvatarInput"),
  profilePhotoInput: document.querySelector("#profilePhotoInput"),
  profileBioInput: document.querySelector("#profileBioInput"),
  workspaceNameInput: document.querySelector("#workspaceNameInput"),
  workspaceTaglineInput: document.querySelector("#workspaceTaglineInput"),
  workspaceWeekInput: document.querySelector("#workspaceWeekInput"),
  defaultOwnerInput: document.querySelector("#defaultOwnerInput"),
  startRouteInput: document.querySelector("#startRouteInput"),
  densityInput: document.querySelector("#densityInput"),
  motionInput: document.querySelector("#motionInput"),
  visualIntensityInput: document.querySelector("#visualIntensityInput"),
  accentColorInput: document.querySelector("#accentColorInput"),
  hotColorInput: document.querySelector("#hotColorInput"),
  cyanColorInput: document.querySelector("#cyanColorInput"),
  magentaColorInput: document.querySelector("#magentaColorInput"),
  jarvisDefaultOpenInput: document.querySelector("#jarvisDefaultOpenInput"),
  profileResetBtn: document.querySelector("#profileResetBtn"),
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
  messageDraftInput: document.querySelector("#messageDraftInput"),
  jarvisShell: document.querySelector("#jarvisShell"),
  jarvisToggle: document.querySelector("#jarvisToggle"),
  jarvisCount: document.querySelector("#jarvisCount"),
  jarvisMode: document.querySelector("#jarvisMode"),
  jarvisFeed: document.querySelector("#jarvisFeed"),
  jarvisSuggestions: document.querySelector("#jarvisSuggestions"),
  jarvisForm: document.querySelector("#jarvisForm"),
  jarvisInput: document.querySelector("#jarvisInput")
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
  "2026-06-29": "Décoder le signal avant de foncer.",
  "2026-06-30": "Un call verrouillé vaut deux relances.",
  "2026-07-01": "Date, lieu, pilote : pas de flou dans le multivers.",
  "2026-07-02": "Fermer les mini-failles libère la tête.",
  "2026-07-03": "Vitesse oui, brouillon non.",
  "2026-07-04": "Rendre le travail visible, sinon il n'existe pas.",
  "2026-07-05": "Review, preuve, prochain move."
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
  return `${contact.name} - ${due.label} - ${contact.nextAction || "Next move à poser"}`;
}

function normalizeCommand(value) {
  return String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function defaultSession() {
  return {
    version: 1,
    updatedAt: null,
    profile: {
      name: "Mathis",
      handle: "Kroma",
      role: "Chef de projet créatif",
      email: "",
      avatarText: "MD",
      avatarImage: "",
      bio: "Piloter Kroma, garder les deadlines propres, transformer les mails en missions actionnables."
    },
    workspace: {
      name: "Kroma HQ",
      tagline: "Street-Verse ops",
      weekLabel: "29 juin - 5 juillet",
      commandLabel: "Console Jarvis"
    },
    preferences: {
      accentColor: "#7a2cff",
      hotColor: "#ff1744",
      cyanColor: "#00f7ff",
      magentaColor: "#ff2bd6",
      density: "comfortable",
      motion: "on",
      visualIntensity: 82,
      defaultOwner: "Mathis",
      startRoute: "dashboard",
      jarvisDefaultOpen: false
    }
  };
}

function emptyMailDatabase() {
  return {
    version: 1,
    updatedAt: null,
    source: "Gmail missions",
    watchQuery: "from:sender@example.com",
    processedMessageIds: [],
    imports: [],
    tasks: [],
    shoots: [],
    weeklyRecaps: []
  };
}

const staticStorageKey = "kroma-crm-static-contacts-v1";
const staticSessionStorageKey = "kroma-crm-session-v1";
const staticMailDbStorageKey = "kroma-crm-mail-db-v1";

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
    if (nextContacts.length === contacts.length) throw new Error("Dossier introuvable.");
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

  throw new Error("Action hors radar.");
}

function readStaticSession() {
  const saved = localStorage.getItem(staticSessionStorageKey);
  return saved ? JSON.parse(saved) : defaultSession();
}

function writeStaticSession(session) {
  localStorage.setItem(staticSessionStorageKey, JSON.stringify(session));
}

function readStaticMailDb() {
  const saved = localStorage.getItem(staticMailDbStorageKey);
  return saved ? JSON.parse(saved) : emptyMailDatabase();
}

async function staticFallback(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  if (path.startsWith("/api/contacts")) return staticApi(path, options);
  if (method === "GET" && path === "/api/session") return { session: readStaticSession() };
  if (method === "PUT" && path === "/api/session") {
    const session = { ...readStaticSession(), ...getBody(options), updatedAt: new Date().toISOString() };
    writeStaticSession(session);
    return { session };
  }
  if (method === "GET" && path === "/api/mail-database") return readStaticMailDb();
  throw new Error("Action hors radar.");
}

async function api(path, options = {}) {
  try {
    const response = await fetch(path, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    const isJson = response.headers.get("content-type")?.includes("application/json");
    if (!isJson && path.startsWith("/api/")) return staticFallback(path, options);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Erreur radar.");
    return payload;
  } catch (error) {
    if (path.startsWith("/api/") && (error.name === "TypeError" || error instanceof SyntaxError)) {
      return staticFallback(path, options);
    }
    throw error;
  }
}

async function loadContacts() {
  const [payload, mailDb, sessionPayload] = await Promise.all([
    api("/api/contacts"),
    api("/api/mail-database").catch(() => emptyMailDatabase()),
    api("/api/session").catch(() => ({ session: defaultSession() }))
  ]);
  state.contacts = payload.contacts;
  state.mailDb = mailDb;
  state.session = sessionPayload.session || defaultSession();
  state.stages = payload.stages || stageOrder;
  if (!state.selectedId && state.contacts.length) state.selectedId = rankedContacts()[0].id;
  applySession();
  initJarvis();
  render();
}

function applySession() {
  const session = state.session || defaultSession();
  const preferences = session.preferences || defaultSession().preferences;
  const root = document.documentElement;
  root.style.setProperty("--violet", preferences.accentColor || "#7a2cff");
  root.style.setProperty("--red", preferences.hotColor || "#ff1744");
  root.style.setProperty("--cyan", preferences.cyanColor || "#00f7ff");
  root.style.setProperty("--magenta", preferences.magentaColor || "#ff2bd6");
  root.style.setProperty("--visual-alpha", String((Number(preferences.visualIntensity || 82) / 100).toFixed(2)));
  document.body.dataset.density = preferences.density || "comfortable";
  document.body.dataset.motion = preferences.motion || "on";

  if (els.brandName) els.brandName.textContent = session.workspace?.name || "Kroma HQ";
  if (els.brandTagline) els.brandTagline.textContent = session.workspace?.tagline || "Street-Verse ops";
  if (els.weekLabel) els.weekLabel.textContent = session.workspace?.weekLabel || "29 juin - 5 juillet";
  if (els.commandLabel) els.commandLabel.textContent = session.workspace?.commandLabel || "Console Jarvis";
  if (els.navProfile) els.navProfile.textContent = session.profile?.avatarText || "MD";

  if (!location.hash && preferences.startRoute && routeMeta[preferences.startRoute]) {
    state.route = preferences.startRoute;
  }
  if (preferences.jarvisDefaultOpen && !state.agentMessages.length) {
    state.agentOpen = true;
  }
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
  if (els.navMail) els.navMail.textContent = state.mailDb?.imports?.length || 0;
  if (els.navProfile) els.navProfile.textContent = state.session?.profile?.avatarText || "MD";

  const metrics = [
    ["Impact ouvert", currency.format(pipeline), `${active.length} missions vivantes`],
    ["Signaux chauds", due.length, "Aujourd'hui + 7 jours"],
    ["Bouclées", `${win}%`, `${done.length} missions verrouillées`],
    ["Arc semaine", weekContacts().length, "impacts au tempo"]
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
        <p class="eyebrow">Radar</p>
        <h2>Prochain move</h2>
      </div>
      ${next ? `<span class="due-pill ${dueMeta(next).tone}">${escapeHtml(dueMeta(next).label)}</span>` : ""}
    </div>
    ${
      next
        ? `<button class="focus-item" type="button" data-contact="${escapeHtml(next.id)}">
            <strong>${escapeHtml(next.name)}</strong>
            <span>${escapeHtml(next.nextAction || "Next move à poser")}</span>
          </button>`
        : `<div class="empty-state">Aucune mission active.</div>`
    }
  `;

  els.nextPanel.innerHTML = `
    <div class="panel-header">
      <div>
        <p class="eyebrow">Signaux</p>
        <h2>Chaud devant</h2>
      </div>
      <button class="ghost-button compact" type="button" data-route-target="contacts">Voir dossiers</button>
    </div>
    <div class="mini-list">
      ${
        due.slice(0, 4).map((contact) => `
          <button class="mini-item" type="button" data-contact="${escapeHtml(contact.id)}">
            <strong>${escapeHtml(contact.name)}</strong>
            <span>${escapeHtml(contactLine(contact))}</span>
          </button>
        `).join("") || `<div class="empty-state">Aucun signal chaud.</div>`
      }
    </div>
  `;

  els.briefPanel.innerHTML = `
    <div class="panel-header">
      <div>
        <p class="eyebrow">Scan</p>
        <h2>Semaine missions</h2>
      </div>
      <button class="ghost-button compact" type="button" data-route-target="agenda">Tempo</button>
    </div>
    <div class="mini-list">
      ${
        week.slice(0, 5).map((contact) => `
          <button class="mini-item" type="button" data-contact="${escapeHtml(contact.id)}">
            <strong>${escapeHtml(contact.name)}</strong>
            <span>${escapeHtml(contact.nextAction || "Next move à poser")}</span>
          </button>
        `).join("") || `<div class="empty-state">Aucun impact au tempo.</div>`
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
                <small>${escapeHtml(contact.nextAction || contact.sensitivity || "Aucun next move")}</small>
                <span class="due-pill ${dueMeta(contact).tone}">${escapeHtml(dueMeta(contact).label)}</span>
              </button>
            `).join("") || `<p class="agenda-empty">Zone clean</p>`
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
  els.agendaSummary.textContent = `${week.length} impacts cette semaine - ${urgent} alertes rouges`;

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
                <span>${escapeHtml(contact.nextAction || "Next move à poser")}</span>
              </button>
            `).join("") || `<p class="agenda-empty">Respire</p>`
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
  const tabs = [{ value: "all", label: "Tout le verse" }, ...state.stages.map((stage) => ({ value: stage, label: stageLabels[stage] || stage }))];
  els.stageTabs.innerHTML = tabs.map((tab) => `
    <button class="stage-tab ${state.stageFilter === tab.value ? "active" : ""}" type="button" data-stage="${escapeHtml(tab.value)}">
      ${escapeHtml(tab.label)}
    </button>
  `).join("");
  const current = tabs.find((tab) => tab.value === state.stageFilter);
  els.listTitle.textContent = current?.label || "Tous les dossiers";
}

function renderContactList() {
  const contacts = filteredContacts();
  els.contactList.innerHTML = contacts.map((contact) => `
    <button class="contact-card ${contact.id === state.selectedId ? "active" : ""}" type="button" data-contact="${escapeHtml(contact.id)}">
      <span>
        <strong>${escapeHtml(contact.name)}</strong>
        <small>${escapeHtml(contact.company)}</small>
        <small>${escapeHtml(contact.nextAction || contact.sensitivity || "Aucun next move")}</small>
      </span>
      <span class="contact-card-meta">
        <span class="badge ${escapeHtml(contact.stage)}">${escapeHtml(stageLabels[contact.stage] || contact.stage)}</span>
        <span class="due-pill ${dueMeta(contact).tone}">${escapeHtml(dueMeta(contact).label)}</span>
      </span>
    </button>
  `).join("") || `<div class="empty-state">Aucun dossier dans ce secteur.</div>`;
}

function renderDetail() {
  const contact = state.contacts.find((item) => item.id === state.selectedId);
  if (!contact) {
    els.detailPanel.innerHTML = `<div class="empty-state">Sélectionne un dossier.</div>`;
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
        <button class="ghost-button compact" type="button" data-action="edit">Retoucher</button>
        <button class="danger-button compact" type="button" data-action="delete">Effacer</button>
      </div>
    </div>
    <div class="detail-body">
      <div class="info-tile wide">
        <span>Next move</span>
        <strong>${escapeHtml(contact.nextAction || "Next move à poser")}</strong>
      </div>
      <div class="detail-grid">
        <div class="info-tile"><span>Tempo</span><strong>${escapeHtml(due.label)}</strong></div>
        <div class="info-tile"><span>Impact</span><strong>${currency.format(contact.value || 0)}</strong></div>
        <div class="info-tile"><span>Pilote</span><strong>${escapeHtml(contact.owner || "Mathis")}</strong></div>
        <div class="info-tile"><span>Type</span><strong>${escapeHtml(contact.projectType || "Mission")}</strong></div>
        <div class="info-tile wide"><span>Friction</span><strong>${escapeHtml(contact.sensitivity || "Aucune friction")}</strong></div>
        <div class="info-tile wide"><span>Signal source</span><strong>${escapeHtml(contact.source || "Non renseigné")}</strong></div>
      </div>
      ${
        contact.messageDraft
          ? `<section class="message-box">
              <div class="panel-header">
                <div><p class="eyebrow">Message</p><h2>Phrase prête</h2></div>
                <button class="ghost-button compact" type="button" data-action="copy">Copier</button>
              </div>
              <pre>${escapeHtml(contact.messageDraft)}</pre>
            </section>`
          : ""
      }
      <form class="note-form" data-action="note">
        <textarea name="note" rows="3" placeholder="Ajouter un pense-bête..."></textarea>
        <button class="primary-button" type="submit">Ajouter</button>
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
    <div class="mini-item"><strong>${activeContacts().length} missions actives</strong><span>${due.length} signaux à surveiller</span></div>
    <div class="mini-item"><strong>${week.length} impacts semaine</strong><span>${week.slice(0, 3).map((contact) => contact.name).join(" / ") || "RAS"}</span></div>
  `;
  els.assistantNext.innerHTML = next
    ? `<button class="focus-item" type="button" data-contact="${escapeHtml(next.id)}"><strong>${escapeHtml(next.name)}</strong><span>${escapeHtml(next.nextAction || "Next move à poser")}</span></button>`
    : `<div class="empty-state">Aucun next move.</div>`;
}

function formatMailDate(value) {
  if (!value) return "Sans date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function renderMailDatabase() {
  if (!els.mailDbSummary) return;
  const db = state.mailDb || emptyMailDatabase();
  const imports = db.imports || [];
  const shoots = db.shoots || [];
  const tasks = db.tasks || [];
  els.mailDbSummary.textContent = `${imports.length} mails traités - ${tasks.length} tâches - ${shoots.length} tournages`;

  els.mailDbImports.innerHTML = `
    <div class="panel-header">
      <div><p class="eyebrow">Gmail</p><h2>Messages captés</h2></div>
      <span class="stage-pill en_cours">${imports.length}</span>
    </div>
    <div class="mini-list">
      ${
        imports.slice(-6).reverse().map((item) => `
          <article class="mini-item">
            <strong>${escapeHtml(item.subject || "Mail mission")}</strong>
            <span>${escapeHtml(item.kind || "mail")} - ${escapeHtml(formatMailDate(item.emailTs || item.importedAt))}</span>
          </article>
        `).join("") || `<div class="empty-state">Aucun mail importé pour l'instant.</div>`
      }
    </div>
  `;

  els.mailDbShoots.innerHTML = `
    <div class="panel-header">
      <div><p class="eyebrow">Tournages</p><h2>Planning généré</h2></div>
      <span class="stage-pill relancer">${shoots.length}</span>
    </div>
    <div class="mini-list">
      ${
        shoots.slice(-6).reverse().map((shoot) => `
          <article class="mini-item">
            <strong>${escapeHtml(shoot.title)}</strong>
            <span>${escapeHtml([shoot.date, shoot.startTime, shoot.location].filter(Boolean).join(" - ") || "À cadrer")}</span>
          </article>
        `).join("") || `<div class="empty-state">Aucun tournage détecté.</div>`
      }
    </div>
  `;

  els.mailDbTasks.innerHTML = `
    <div class="panel-header">
      <div><p class="eyebrow">Tâches</p><h2>Missions générées</h2></div>
      <span class="stage-pill clarifier">${tasks.length}</span>
    </div>
    <div class="mini-list">
      ${
        tasks.slice(-7).reverse().map((task) => `
          <article class="mini-item">
            <strong>${escapeHtml(task.title)}</strong>
            <span>${escapeHtml([task.owner, task.deadline, task.category].filter(Boolean).join(" - ") || "Sans contexte")}</span>
          </article>
        `).join("") || `<div class="empty-state">Aucune tâche générée.</div>`
      }
    </div>
  `;
}

function fillProfileForm() {
  if (!els.profileForm) return;
  const session = state.session || defaultSession();
  const profile = session.profile || {};
  const workspace = session.workspace || {};
  const preferences = session.preferences || {};
  els.profileNameInput.value = profile.name || "";
  els.profileHandleInput.value = profile.handle || "";
  els.profileRoleInput.value = profile.role || "";
  els.profileEmailInput.value = profile.email || "";
  els.profileAvatarInput.value = profile.avatarText || "";
  els.profileBioInput.value = profile.bio || "";
  if (els.profilePhotoInput) els.profilePhotoInput.value = "";
  els.workspaceNameInput.value = workspace.name || "";
  els.workspaceTaglineInput.value = workspace.tagline || "";
  els.workspaceWeekInput.value = workspace.weekLabel || "";
  els.defaultOwnerInput.value = preferences.defaultOwner || profile.name || "";
  els.startRouteInput.value = preferences.startRoute || "dashboard";
  els.densityInput.value = preferences.density || "comfortable";
  els.motionInput.value = preferences.motion || "on";
  els.visualIntensityInput.value = preferences.visualIntensity || 82;
  els.accentColorInput.value = preferences.accentColor || "#7a2cff";
  els.hotColorInput.value = preferences.hotColor || "#ff1744";
  els.cyanColorInput.value = preferences.cyanColor || "#00f7ff";
  els.magentaColorInput.value = preferences.magentaColor || "#ff2bd6";
  els.jarvisDefaultOpenInput.checked = Boolean(preferences.jarvisDefaultOpen);
}

function renderProfile() {
  if (!els.profilePreview) return;
  const session = state.session || defaultSession();
  const profile = session.profile || {};
  const preferences = session.preferences || {};
  const avatarImage = String(profile.avatarImage || "");
  const avatarMarkup = avatarImage.startsWith("data:image/")
    ? `<img src="${escapeHtml(avatarImage)}" alt="${escapeHtml(profile.name || "Profil")}">`
    : escapeHtml(profile.avatarText || "MD");
  els.profilePreview.innerHTML = `
    <div class="profile-hero">
      <div class="avatar-badge">${avatarMarkup}</div>
      <div>
        <p class="eyebrow">${escapeHtml(profile.handle || "Kroma")}</p>
        <h2>${escapeHtml(profile.name || "Mathis")}</h2>
        <strong>${escapeHtml(profile.role || "Chef de projet créatif")}</strong>
      </div>
    </div>
    <p class="profile-bio">${escapeHtml(profile.bio || "Profil à compléter.")}</p>
    <div class="profile-tokens">
      <span style="--token:${escapeHtml(preferences.accentColor || "#7a2cff")}">Accent</span>
      <span style="--token:${escapeHtml(preferences.hotColor || "#ff1744")}">Signal</span>
      <span style="--token:${escapeHtml(preferences.cyanColor || "#00f7ff")}">Cyan</span>
      <span style="--token:${escapeHtml(preferences.magentaColor || "#ff2bd6")}">Magenta</span>
    </div>
    <div class="mini-list profile-stats">
      <div class="mini-item"><strong>${escapeHtml(preferences.defaultOwner || "Mathis")}</strong><span>Pilote par défaut</span></div>
      <div class="mini-item"><strong>${escapeHtml(preferences.density || "comfortable")}</strong><span>Densité UI</span></div>
      <div class="mini-item"><strong>${escapeHtml(String(preferences.visualIntensity || 82))}%</strong><span>Intensité visuelle</span></div>
    </div>
  `;
  fillProfileForm();
}

function jarvisFocus() {
  return dueContacts()[0] || weekContacts()[0] || rankedContacts(activeContacts())[0];
}

function initJarvis() {
  if (state.agentMessages.length) return;
  const due = dueContacts();
  const focus = jarvisFocus();
  state.agentMessages = [{
    role: "agent",
    text: focus
      ? `Radar chargé. Signal prioritaire: ${focus.name}. ${due.length} alerte(s) à surveiller.`
      : "Radar chargé. Aucune mission active détectée."
  }];
}

function pushJarvisMessage(role, text) {
  state.agentMessages = [...state.agentMessages, { role, text }].slice(-10);
  renderJarvis();
}

function renderJarvis() {
  if (!els.jarvisShell) return;
  const due = dueContacts();
  const active = activeContacts();
  const focus = jarvisFocus();

  els.jarvisShell.classList.toggle("open", state.agentOpen);
  els.jarvisToggle.setAttribute("aria-expanded", String(state.agentOpen));
  els.jarvisCount.textContent = due.length;
  els.jarvisMode.textContent = due.length ? `${due.length} alerte${due.length > 1 ? "s" : ""}` : "Clear";

  els.jarvisFeed.innerHTML = state.agentMessages.map((message) => `
    <article class="jarvis-message ${escapeHtml(message.role)}">
      <span>${message.role === "user" ? "Toi" : "Jarvis"}</span>
      <p>${escapeHtml(message.text)}</p>
    </article>
  `).join("");
  els.jarvisFeed.scrollTop = els.jarvisFeed.scrollHeight;

  els.jarvisSuggestions.innerHTML = `
    <button type="button" data-agent-command="brief">Scan ${active.length}</button>
    <button type="button" data-agent-command="relances">Signaux ${due.length}</button>
    <button type="button" data-agent-command="agenda">Tempo</button>
    <button type="button" data-agent-command="${focus ? `cherche ${escapeHtml(focus.name)}` : "focus"}">Focus</button>
  `;
}

function jarvisReply(raw) {
  const command = String(raw || "").trim();
  if (!command) {
    pushJarvisMessage("agent", "Dis-moi: scan, relances, tempo, missions, base mail, profil, cherche un dossier, ou nouvelle mission.");
    return;
  }

  pushJarvisMessage("user", command);
  els.jarvisMode.textContent = "Analyse";

  window.setTimeout(() => {
    processJarvisCommand(command);
  }, 180);
}

function processJarvisCommand(raw) {
  const normalized = normalizeCommand(raw);
  const due = dueContacts();
  const week = weekContacts();
  const active = activeContacts();
  const focus = jarvisFocus();

  if (normalized.includes("aide") || normalized.includes("help")) {
    pushJarvisMessage("agent", "Commandes: scan, relances, tempo, missions, base mail, profil, dossiers, nouvelle mission, cherche + nom.");
    return;
  }

  if (normalized.includes("nouveau") || normalized.includes("nouvelle")) {
    setRoute("contacts");
    openDialog();
    pushJarvisMessage("agent", "Nouvelle mission ouverte. Remplis la fiche, je garde le radar synchronisé.");
    return;
  }

  if (normalized.includes("agenda") || normalized.includes("deadline") || normalized.includes("tempo")) {
    setRoute("agenda");
    pushJarvisMessage("agent", `${week.length} impact(s) cette semaine. J'ai ouvert le tempo opérationnel.`);
    return;
  }

  if (normalized.includes("pipeline") || normalized.includes("mission")) {
    setRoute("pipeline");
    pushJarvisMessage("agent", `${active.length} mission(s) actives sur le board. Vue par statut ouverte.`);
    return;
  }

  if (normalized.includes("contact") || normalized.includes("crm") || normalized.includes("dossier")) {
    setRoute("contacts");
    pushJarvisMessage("agent", "Deck missions ouvert. Sélectionne un dossier ou demande-moi une recherche.");
    return;
  }

  if (normalized.includes("base") || normalized.includes("mail") || normalized.includes("gmail")) {
    setRoute("database");
    const db = state.mailDb || emptyMailDatabase();
    pushJarvisMessage("agent", `Base mail ouverte: ${(db.imports || []).length} mails, ${(db.tasks || []).length} tâches, ${(db.shoots || []).length} tournages.`);
    return;
  }

  if (normalized.includes("profil") || normalized.includes("profile") || normalized.includes("session")) {
    setRoute("profile");
    pushJarvisMessage("agent", "Profil ouvert. Tu peux changer l'identité, les couleurs, la densité et le comportement Jarvis.");
    return;
  }

  if (normalized.includes("relance") || normalized.includes("signal")) {
    state.stageFilter = "all";
    state.query = "";
    if (els.searchInput) els.searchInput.value = "";
    setRoute("contacts");
    render();
    const lines = due.slice(0, 3).map(contactLine);
    pushJarvisMessage("agent", lines.length ? `Signaux chauds: ${lines.join(" | ")}` : "Aucun signal chaud. Tu peux avancer sur du fond.");
    return;
  }

  if (normalized.includes("focus") || normalized.includes("brief") || normalized.includes("scan")) {
    setRoute("dashboard");
    pushJarvisMessage("agent", focus
      ? `Scan: ${active.length} mission(s) actives, ${due.length} signal(aux). Focus maintenant: ${contactLine(focus)}`
      : "Scan: aucune mission active. Radar clair.");
    return;
  }

  if (normalized.includes("da") || normalized.includes("brand") || normalized.includes("design")) {
    setRoute("brand");
    pushJarvisMessage("agent", "DA ouverte. Mode Street-Verse chargé: noir, glitch, halftone, contours sticker.");
    return;
  }

  const search = normalized.replace(/^cherche\s+|^recherche\s+|^trouve\s+|^ouvre\s+/, "").trim() || raw;
  state.query = search;
  state.stageFilter = "all";
  if (els.searchInput) els.searchInput.value = search;
  setRoute("contacts");
  render();
  const results = filteredContacts();
  if (results[0]) state.selectedId = results[0].id;
  render();
  pushJarvisMessage("agent", `${results.length} signal(aux) pour "${search}". ${results[0] ? `J'ai sélectionné ${results[0].name}.` : "Rien de net trouvé."}`);
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
  renderMailDatabase();
  renderProfile();
  renderJarvis();
}

function commandOutput(message) {
  els.commandOutput.textContent = message;
}

function runCommand(raw) {
  const command = raw.trim();
  if (!command) {
    commandOutput("Radar prêt. Missions chargées.");
    return;
  }
  const normalized = normalizeCommand(command);
  if (normalized.includes("nouveau") || normalized.includes("nouvelle")) {
    setRoute("contacts");
    openDialog();
    commandOutput("Nouvelle mission ouverte.");
    return;
  }
  if (normalized.includes("agenda") || normalized.includes("deadline") || normalized.includes("tempo")) {
    setRoute("agenda");
    commandOutput(`Tempo ouvert: ${weekContacts().length} impacts cette semaine.`);
    return;
  }
  if (normalized.includes("pipeline") || normalized.includes("mission")) {
    setRoute("pipeline");
    commandOutput("Board missions ouvert.");
    return;
  }
  if (normalized.includes("base") || normalized.includes("mail") || normalized.includes("gmail")) {
    setRoute("database");
    const db = state.mailDb || emptyMailDatabase();
    commandOutput(`Base mail ouverte: ${(db.imports || []).length} mails traités.`);
    return;
  }
  if (normalized.includes("profil") || normalized.includes("profile") || normalized.includes("session")) {
    setRoute("profile");
    commandOutput("Session utilisateur ouverte.");
    return;
  }
  if (normalized.includes("relance") || normalized.includes("signal")) {
    state.stageFilter = "all";
    state.query = "";
    setRoute("contacts");
    commandOutput(dueContacts().slice(0, 4).map(contactLine).join(" | ") || "Aucun signal chaud.");
    return;
  }
  if (normalized.includes("focus") || normalized.includes("brief")) {
    setRoute("dashboard");
    const next = dueContacts()[0] || rankedContacts(activeContacts())[0];
    commandOutput(next ? `Focus: ${contactLine(next)}` : "Aucune mission active.");
    return;
  }
  if (normalized.includes("da") || normalized.includes("brand")) {
    setRoute("brand");
    commandOutput("DA Street-Verse ouverte.");
    return;
  }
  const search = normalized.replace(/^cherche\s+|^recherche\s+|^trouve\s+/, "").trim() || command;
  state.query = search;
  state.stageFilter = "all";
  els.searchInput.value = search;
  setRoute("contacts");
  render();
  commandOutput(`${filteredContacts().length} signal(aux) pour "${search}".`);
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
  els.dialogTitle.textContent = contact ? "Retoucher la mission" : "Nouvelle mission";
  els.nameInput.value = contact?.name || "";
  els.companyInput.value = contact?.company || "";
  els.emailInput.value = contact?.email || "";
  els.phoneInput.value = contact?.phone || "";
  els.stageInput.value = contact?.stage || "clarifier";
  els.valueInput.value = contact?.value || "";
  els.nextActionInput.value = contact?.nextAction || "";
  els.nextActionDateInput.value = contact?.nextActionDate || "";
  els.ownerInput.value = contact?.owner || state.session?.preferences?.defaultOwner || "Mathis";
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

function sessionPayload() {
  const current = state.session || defaultSession();
  return {
    ...current,
    profile: {
      name: els.profileNameInput.value,
      handle: els.profileHandleInput.value,
      role: els.profileRoleInput.value,
      email: els.profileEmailInput.value,
      avatarText: els.profileAvatarInput.value,
      avatarImage: state.session?.profile?.avatarImage || "",
      bio: els.profileBioInput.value
    },
    workspace: {
      ...(current.workspace || {}),
      name: els.workspaceNameInput.value,
      tagline: els.workspaceTaglineInput.value,
      weekLabel: els.workspaceWeekInput.value,
      commandLabel: current.workspace?.commandLabel || "Console Jarvis"
    },
    preferences: {
      ...(current.preferences || {}),
      accentColor: els.accentColorInput.value,
      hotColor: els.hotColorInput.value,
      cyanColor: els.cyanColorInput.value,
      magentaColor: els.magentaColorInput.value,
      density: els.densityInput.value,
      motion: els.motionInput.value,
      visualIntensity: Number(els.visualIntensityInput.value),
      defaultOwner: els.defaultOwnerInput.value,
      startRoute: els.startRouteInput.value,
      jarvisDefaultOpen: els.jarvisDefaultOpenInput.checked
    }
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
    toast(id ? "Mission mise à jour" : "Mission ajoutée");
  } catch (error) {
    toast(error.message);
  }
}

async function saveSession(event) {
  event.preventDefault();
  try {
    const result = await api("/api/session", { method: "PUT", body: JSON.stringify(sessionPayload()) });
    state.session = result.session;
    applySession();
    render();
    toast("Session sauvegardée");
  } catch (error) {
    toast(error.message);
  }
}

async function reloadSession() {
  try {
    const result = await api("/api/session");
    state.session = result.session || defaultSession();
    applySession();
    render();
    toast("Session rechargée");
  } catch (error) {
    toast(error.message);
  }
}

function applyProfilePreset(name) {
  const presets = {
    street: {
      accentColor: "#7a2cff",
      hotColor: "#ff1744",
      cyanColor: "#00f7ff",
      magentaColor: "#ff2bd6",
      density: "comfortable",
      motion: "on",
      visualIntensity: 92
    },
    stealth: {
      accentColor: "#4c4cff",
      hotColor: "#b855ff",
      cyanColor: "#8cf8ff",
      magentaColor: "#9b5cff",
      density: "compact",
      motion: "reduced",
      visualIntensity: 52
    },
    impact: {
      accentColor: "#ff2bd6",
      hotColor: "#ff1744",
      cyanColor: "#00f7ff",
      magentaColor: "#f4d35e",
      density: "spacious",
      motion: "on",
      visualIntensity: 100
    }
  };
  const preset = presets[name];
  if (!preset) return;
  els.accentColorInput.value = preset.accentColor;
  els.hotColorInput.value = preset.hotColor;
  els.cyanColorInput.value = preset.cyanColor;
  els.magentaColorInput.value = preset.magentaColor;
  els.densityInput.value = preset.density;
  els.motionInput.value = preset.motion;
  els.visualIntensityInput.value = preset.visualIntensity;
  state.session = sessionPayload();
  applySession();
  renderProfile();
}

function readProfilePhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Photo impossible à lire."));
    reader.readAsDataURL(file);
  });
}

async function handleProfilePhoto(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    toast("Choisis une image.");
    return;
  }
  if (file.size > 2_000_000) {
    toast("Photo trop lourde : 2 Mo max.");
    event.target.value = "";
    return;
  }
  try {
    const image = await readProfilePhoto(file);
    state.session = sessionPayload();
    state.session.profile.avatarImage = image;
    applySession();
    renderProfile();
    toast("Photo chargée");
  } catch (error) {
    toast(error.message);
  }
}

async function deleteContact(contact) {
  if (!confirm(`Effacer ${contact.name} ?`)) return;
  try {
    await api(`/api/contacts/${encodeURIComponent(contact.id)}`, { method: "DELETE" });
    state.selectedId = null;
    await loadContacts();
    toast("Mission effacée");
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
    toast("Pense-bête ajouté");
  } catch (error) {
    toast(error.message);
  }
}

async function copyMessage(contact) {
  try {
    await navigator.clipboard.writeText(contact.messageDraft || "");
    toast("Message copié");
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
  const agentButton = event.target.closest("[data-agent-command]");
  if (agentButton) {
    state.agentOpen = true;
    renderJarvis();
    jarvisReply(agentButton.dataset.agentCommand);
    return;
  }

  const routeButton = event.target.closest("[data-route]");
  if (routeButton) setRoute(routeButton.dataset.route);

  const routeTarget = event.target.closest("[data-route-target]");
  if (routeTarget) setRoute(routeTarget.dataset.routeTarget);

  const commandButton = event.target.closest("[data-command]");
  if (commandButton) {
    els.commandInput.value = commandButton.dataset.command;
    runCommand(commandButton.dataset.command);
  }

  const presetButton = event.target.closest("[data-profile-preset]");
  if (presetButton) {
    applyProfilePreset(presetButton.dataset.profilePreset);
    return;
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

els.jarvisToggle?.addEventListener("click", () => {
  state.agentOpen = !state.agentOpen;
  renderJarvis();
  if (state.agentOpen) window.setTimeout(() => els.jarvisInput?.focus(), 120);
});

els.jarvisForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  jarvisReply(els.jarvisInput.value);
  els.jarvisInput.value = "";
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
els.profileForm?.addEventListener("submit", saveSession);
els.profileResetBtn?.addEventListener("click", reloadSession);
els.profilePhotoInput?.addEventListener("change", handleProfilePhoto);
els.profileForm?.addEventListener("input", () => {
  state.session = sessionPayload();
  applySession();
  renderProfile();
});

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
