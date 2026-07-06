(function () {
  const CONVOS_KEY = "kiwoConversations";

  function getConvos() {
    try { return JSON.parse(localStorage.getItem(CONVOS_KEY)) || []; }
    catch { return []; }
  }
  function saveConvos(convos) {
    localStorage.setItem(CONVOS_KEY, JSON.stringify(convos));
  }

  let convos = getConvos();
  let activeId = convos.length ? convos[0].id : null;

  const listEl = document.getElementById("kiwo-convo-list");
  const messagesEl = document.getElementById("kiwo-messages");
  const titleEl = document.getElementById("kiwo-convo-title");
  const modeEl = document.getElementById("kiwo-mode-indicator");
  const textInput = document.getElementById("kiwo-text-input");
  const sendBtn = document.getElementById("kiwo-send-btn");
  const fileBtn = document.getElementById("kiwo-file-btn");
  const fileInput = document.getElementById("kiwo-file-input");
  const newChatBtn = document.getElementById("kiwo-new-chat-btn");

  function isOnline() {
    return window.Kiwo ? window.Kiwo.isOnline() : navigator.onLine;
  }

  function updateModeIndicator() {
    const online = isOnline();
    modeEl.textContent = online ? "Online" : "Offline";
    modeEl.className = "kiwo-mode-indicator " + (online ? "kiwo-online" : "kiwo-offline");
  }

  function createConvo() {
    const convo = { id: "c" + Date.now(), title: "New chat", messages: [] };
    convos.unshift(convo);
    activeId = convo.id;
    saveConvos(convos);
    renderConvoList();
    renderMessages();
  }

  function getActiveConvo() {
    return convos.find(c => c.id === activeId);
  }

  function renderConvoList() {
    listEl.innerHTML = "";
    if (!convos.length) {
      listEl.innerHTML = `<p style="font-family:var(--font-ui);font-size:0.78rem;color:var(--text-300);">No conversations yet.</p>`;
      return;
    }
    convos.forEach(c => {
      const row = document.createElement("div");
      row.className = "kiwo-convo-row";

      const btn = document.createElement("button");
      btn.className = "kiwo-convo-item" + (c.id === activeId ? " active" : "");
      btn.textContent = c.title || "New chat";
      btn.addEventListener("click", () => {
        activeId = c.id;
        renderConvoList();
        renderMessages();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "kiwo-convo-delete-btn";
      deleteBtn.innerHTML = "&times;";
      deleteBtn.title = "Delete this chat";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteConvo(c.id);
      });

      row.appendChild(btn);
      row.appendChild(deleteBtn);
      listEl.appendChild(row);
    });
  }

  function deleteConvo(id) {
    if (!confirm("Delete this conversation? This can't be undone.")) return;
    convos = convos.filter(c => c.id !== id);
    saveConvos(convos);
    if (activeId === id) {
      activeId = convos.length ? convos[0].id : null;
    }
    renderConvoList();
    renderMessages();
  }

  function renderMessages() {
    const convo = getActiveConvo();
    updateModeIndicator();
    if (!convo) {
      titleEl.textContent = "New chat";
      messagesEl.innerHTML = `<p style="font-family:var(--font-ui);font-size:0.85rem;color:var(--text-300);">Start a new chat to talk with Kiwo.</p>`;
      return;
    }
    titleEl.textContent = convo.title;
    messagesEl.innerHTML = "";
    convo.messages.forEach(m => {
      const div = document.createElement("div");
      div.className = "kiwo-message kiwo-" + m.role;
      div.textContent = m.text;
      messagesEl.appendChild(div);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(role, text) {
    let convo = getActiveConvo();
    if (!convo) {
      convo = { id: "c" + Date.now(), title: "New chat", messages: [] };
      convos.unshift(convo);
      activeId = convo.id;
    }
    convo.messages.push({ role, text });
    if (role === "user" && convo.title === "New chat") {
      convo.title = text.slice(0, 32) + (text.length > 32 ? "…" : "");
    }
    saveConvos(convos);
    renderConvoList();
    renderMessages();
  }

  /* ---------- Offline responder: rule-based, built into the app ---------- */
  function getProgressSummary() {
    try {
      const progress = JSON.parse(localStorage.getItem("egyptAcademyProgress")) || {};
      const data = window.EGYPT_ACADEMY_DATA || {};
      const lessonIds = data.allLessonIds || [];
      const quizzes = data.quizzes || [];
      const doneLessons = lessonIds.filter(id => progress[id]).length;
      const doneQuizzes = quizzes.filter(q => progress[q.id]).length;
      return `You've completed ${doneLessons}/${lessonIds.length} lessons and ${doneQuizzes}/${quizzes.length} quizzes.`;
    } catch {
      return "I couldn't read your progress right now.";
    }
  }

  function offlineRespond(text) {
    const t = text.toLowerCase();
    // 1. progress
    if (t.includes("progress") || t.includes("how am i doing")) {
      return getProgressSummary();
    }
    // 2. pyramids
    if (t.includes("pyramid")) {
      return "The Giza pyramids were built for Khufu, Khafre, and Menkaure around 2560-2510 BCE.";
    }
    // 3. nile
    if (t.includes("nile")) {
      return "The Nile flows north into the Mediterranean Sea and its floods gave Egypt its rich black farmland.";
    }
    // 4. cosmo
    if (t.includes("cosmo")) {
      return "Cosmo is your desktop buddy! You can turn him on and pick his theme from the Cosmo app.";
    }
    // 5. hello
    if (t.includes("hello") || t.includes("hi") || t.includes("hey")) {
      return "Hey! I'm Kiwo, running in offline mode right now. Ask me about your progress, the pyramids, the Nile, or Cosmo.";
    }
    return "I'm in offline mode, so I can only help with a few things right now — try asking about your progress, the pyramids, the Nile, or Cosmo.";
  }

  /* ---------- Online responder: uses the phrase-bank files in apps/kiwo/phrases/ ---------- */
  function onlineRespond(text) {
    if (window.KiwoBrain) return window.KiwoBrain.onlineRespond(text);
    return "That's a great question! (Online phrase bank isn't loaded right now.)";
  }

  function respond(text) {
    return isOnline() ? onlineRespond(text) : offlineRespond(text);
  }

  function handleSend() {
    const text = textInput.value.trim();
    if (!text) return;
    addMessage("user", text);
    textInput.value = "";
    setTimeout(() => addMessage("assistant", respond(text)), 400);
  }

  sendBtn.addEventListener("click", handleSend);
  textInput.addEventListener("keydown", e => { if (e.key === "Enter") handleSend(); });
  newChatBtn.addEventListener("click", createConvo);

  fileBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    let convo = getActiveConvo();
    if (!convo) { createConvo(); convo = getActiveConvo(); }
    convo.messages.push({ role: "file", text: `📎 ${file.name} (${Math.round(file.size / 1024)} KB)` });
    saveConvos(convos);
    renderMessages();
    setTimeout(() => addMessage("assistant", `Got your file "${file.name}". ${isOnline() ? "I can reference it in this chat." : "I'm offline right now, so I can't fully analyze files, but I've noted it."}`), 400);
    fileInput.value = "";
  });

  window.addEventListener("online", updateModeIndicator);
  window.addEventListener("offline", updateModeIndicator);

  renderConvoList();
  if (!activeId && convos.length) activeId = convos[0].id;
  renderMessages();

  window.currentAppTeardown = function () {
    window.removeEventListener("online", updateModeIndicator);
    window.removeEventListener("offline", updateModeIndicator);
  };
})();
