const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const CRM_FILE = path.join(DATA_DIR, "crm.json");
const MAIL_DB_FILE = path.join(DATA_DIR, "viral-mail-db.json");
const stages = ["clarifier", "relancer", "en_cours", "bloque", "fait"];

function emptyDb() {
  return {
    version: 1,
    updatedAt: null,
    source: "Gmail missions",
    watchQuery: "from:sender@example.com (subject:(tâches OR taches OR tournage OR invitation) OR tournage OR tasks)",
    processedMessageIds: [],
    imports: [],
    tasks: [],
    shoots: [],
    weeklyRecaps: []
  };
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

function slug(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56) || "item";
}

function stableId(prefix, sourceId, title) {
  const hash = crypto.createHash("sha1").update(`${sourceId}:${title}`).digest("hex").slice(0, 8);
  return `${prefix}-${slug(title)}-${hash}`;
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function makeNote(text, createdAt, sourceMessageId) {
  return {
    id: `mail-note-${sourceMessageId}-${crypto.randomUUID().slice(0, 8)}`,
    text,
    createdAt
  };
}

function normalizeContact(input, now, sourceMessageId) {
  const name = String(input.name || input.title || "").trim();
  const company = String(input.company || input.client || "Mission mail").trim();
  if (!name) return null;
  const id = String(input.id || input.crmContactId || stableId("mail", sourceMessageId, name)).trim();
  const stage = stages.includes(input.stage) ? input.stage : "clarifier";
  const source = String(input.source || `Gmail missions ${sourceMessageId}`).trim();
  const noteText = String(input.note || input.sourceText || "").trim();
  return {
    id,
    name,
    company,
    email: String(input.email || "").trim(),
    phone: String(input.phone || "").trim(),
    stage,
    value: Number(input.value || 0) || 0,
    nextAction: String(input.nextAction || input.action || "").trim(),
    nextActionDate: String(input.nextActionDate || input.deadline || input.date || "").trim(),
    owner: String(input.owner || "Mathis").trim(),
    source,
    projectType: String(input.projectType || input.category || "Mission mail").trim(),
    sensitivity: String(input.sensitivity || input.context || "").trim(),
    messageDraft: String(input.messageDraft || "").trim(),
    notes: noteText ? [makeNote(noteText, now, sourceMessageId)] : [],
    createdAt: now,
    updatedAt: now
  };
}

function mergeContact(existing, incoming) {
  if (!existing) return incoming;
  const existingNoteTexts = new Set((existing.notes || []).map((note) => note.text));
  const incomingNotes = (incoming.notes || []).filter((note) => !existingNoteTexts.has(note.text));
  return {
    ...existing,
    ...Object.fromEntries(Object.entries(incoming).filter(([, value]) => {
      if (Array.isArray(value)) return false;
      return value !== "" && value !== null && value !== undefined;
    })),
    notes: [...incomingNotes, ...(existing.notes || [])],
    createdAt: existing.createdAt || incoming.createdAt,
    updatedAt: incoming.updatedAt
  };
}

function normalizeTask(task, message, now) {
  const title = String(task.title || task.name || "").trim();
  if (!title) return null;
  return {
    id: String(task.id || stableId("task", message.messageId, title)),
    title,
    owner: String(task.owner || "Mathis").trim(),
    deadline: String(task.deadline || task.nextActionDate || "").trim(),
    status: String(task.status || "open").trim(),
    category: String(task.category || task.projectType || "").trim(),
    sourceMessageId: message.messageId,
    crmContactId: String(task.crmContactId || task.contactId || "").trim(),
    importedAt: now
  };
}

function normalizeShoot(shoot, message, now) {
  const title = String(shoot.title || shoot.name || message.subject || "").trim();
  if (!title) return null;
  return {
    id: String(shoot.id || stableId("shoot", message.messageId, title)),
    title,
    date: String(shoot.date || shoot.nextActionDate || "").trim(),
    startTime: String(shoot.startTime || "").trim(),
    endTime: String(shoot.endTime || "").trim(),
    timezone: String(shoot.timezone || "Europe/Paris").trim(),
    location: String(shoot.location || "").trim(),
    talent: String(shoot.talent || "").trim(),
    participants: Array.isArray(shoot.participants) ? shoot.participants : [],
    nextActions: Array.isArray(shoot.nextActions) ? shoot.nextActions : [],
    sourceMessageId: message.messageId,
    crmContactId: String(shoot.crmContactId || shoot.contactId || "").trim(),
    importedAt: now
  };
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function readPayload() {
  const payloadIndex = process.argv.indexOf("--payload");
  if (payloadIndex === -1) {
    throw new Error("Usage: node scripts/viral-mail-importer.js --payload <file|->");
  }
  const payloadPath = process.argv[payloadIndex + 1];
  if (!payloadPath) throw new Error("Missing payload path.");
  const raw = payloadPath === "-" ? await readStdin() : await fs.readFile(path.resolve(payloadPath), "utf8");
  const payload = JSON.parse(raw);
  return Array.isArray(payload.messages) ? payload.messages : [];
}

async function main() {
  const now = new Date().toISOString();
  const messages = await readPayload();
  const db = await readJson(MAIL_DB_FILE, emptyDb());
  const contacts = await readJson(CRM_FILE, []);
  const contactsById = new Map(contacts.map((contact) => [contact.id, contact]));
  const processed = new Set(db.processedMessageIds || []);
  let imported = 0;

  for (const message of messages) {
    const messageId = String(message.messageId || message.id || "").trim();
    if (!messageId) continue;
    const alreadyProcessed = processed.has(messageId);
    const normalizedMessage = {
      messageId,
      threadId: String(message.threadId || "").trim(),
      subject: String(message.subject || "").trim(),
      from: String(message.from || "").trim(),
      emailTs: String(message.emailTs || "").trim(),
      displayUrl: String(message.displayUrl || "").trim(),
      kind: String(message.kind || "unknown").trim(),
      importedAt: now
    };

    if (!alreadyProcessed) {
      db.imports.push(normalizedMessage);
      processed.add(messageId);
      imported += 1;
    }

    const messageContacts = Array.isArray(message.contacts) ? message.contacts : [];
    const generatedContacts = [
      ...messageContacts,
      ...(Array.isArray(message.tasks) ? message.tasks.map((task) => ({
        ...task,
        id: task.crmContactId || task.contactId,
        name: task.name || task.title,
        company: task.company || "Mission mail",
        nextAction: task.nextAction || task.action,
        nextActionDate: task.nextActionDate || task.deadline,
        projectType: task.projectType || task.category || "Mission mail",
        source: task.source || `Gmail missions - ${normalizedMessage.subject}`
      })) : []),
      ...(Array.isArray(message.shoots) ? message.shoots.map((shoot) => ({
        ...shoot,
        id: shoot.crmContactId || shoot.contactId,
        name: shoot.name || shoot.title,
        company: shoot.company || "Mission mail",
        nextAction: shoot.nextAction || (shoot.nextActions || [])[0] || "Préparer le tournage.",
        nextActionDate: shoot.nextActionDate || shoot.date,
        projectType: shoot.projectType || "Tournage",
        source: shoot.source || `Gmail missions - ${normalizedMessage.subject}`
      })) : [])
    ];

    for (const input of messageContacts.length ? messageContacts : generatedContacts) {
      const contact = normalizeContact(input, now, messageId);
      if (!contact) continue;
      contactsById.set(contact.id, mergeContact(contactsById.get(contact.id), contact));
    }

    if (Array.isArray(message.tasks)) {
      db.tasks.push(...message.tasks.map((task) => normalizeTask(task, normalizedMessage, now)).filter(Boolean));
    }

    if (Array.isArray(message.shoots)) {
      db.shoots.push(...message.shoots.map((shoot) => normalizeShoot(shoot, normalizedMessage, now)).filter(Boolean));
    }

    if (message.weeklyRecap) {
      db.weeklyRecaps.push({
        id: String(message.weeklyRecap.id || stableId("week", messageId, normalizedMessage.subject)),
        sourceMessageId: messageId,
        weekStart: String(message.weeklyRecap.weekStart || "").trim(),
        weekEnd: String(message.weeklyRecap.weekEnd || "").trim(),
        summary: String(message.weeklyRecap.summary || "").trim(),
        importedAt: now
      });
    }
  }

  db.processedMessageIds = [...processed];
  db.imports = uniqueById(db.imports.map((item) => ({ ...item, id: item.messageId }))).map(({ id, ...item }) => item);
  db.tasks = uniqueById(db.tasks);
  db.shoots = uniqueById(db.shoots);
  db.weeklyRecaps = uniqueById(db.weeklyRecaps);
  db.updatedAt = now;

  await writeJson(MAIL_DB_FILE, db);
  await writeJson(CRM_FILE, [...contactsById.values()]);
  console.log(`viral-mail-importer: ${imported} new message(s), ${contactsById.size} CRM mission(s), ${db.tasks.length} task(s), ${db.shoots.length} shoot(s).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
