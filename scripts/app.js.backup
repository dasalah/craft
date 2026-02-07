const STORAGE_KEY = "universityScheduleData";
const CLIPBOARD_KEY = "universityClipboard";
const FIRST_VISIT_KEY = "firstVisit";
const WELCOME_KEY = "hasVisited";
const POMODORO_SETTINGS_KEY = "pomodoroSettings";
const POMODORO_STATS_KEY = "pomodoroStats";
const TODO_KEY = "todoList";
const POMODORO_STATE_KEY = "pomodoroState";
const TIME_SLOTS_KEY = "scheduleTimeSlots";

const radius = 90;
const circumference = 2 * Math.PI * radius;

let clipboard = (() => {
  try {
    return JSON.parse(localStorage.getItem(CLIPBOARD_KEY) || "null");
  } catch {
    return null;
  }
})();
let currentCell = null;
let todos = JSON.parse(localStorage.getItem(TODO_KEY) || "[]");
let currentEditIndex = -1;
let currentFilter = "all";
let currentCategory = "all";
let pomodoroInterval = null;
let pomodoroRunning = false;
let consecutiveWorkSessions = 0;
let studySeconds = 0;
let totalStudySeconds = 0;
let initialSettings = loadPomodoroSettings();
let pomodoroTimeLeft = initialSettings.work * 60;
let pomodoroMode = "work";
let scrollTimeout;
let currentThElement = null;

const modal = document.getElementById("classModal");
const form = document.getElementById("classForm");
const submitBtn = form.querySelector('button[type="submit"]');
const unknownExamCheckbox = document.getElementById("unknownExam");
const unknownRoomCheckbox = document.getElementById("unknownRoom");
const examDateInput = document.getElementById("examDate");
const roomNumberInput = document.getElementById("roomNumber");

const timeModal = document.getElementById("editTimeModal");
const startTimeInput = document.getElementById("startTimeInput");
const endTimeInput = document.getElementById("endTimeInput");
const saveTimeBtn = document.getElementById("saveTimeBtn");
const timeModalCloseBtn = timeModal.querySelector(".close");

const todoForm = document.querySelector(".todo-form");
const todoInput = document.getElementById("todoInput");
const todoCategory = document.getElementById("todoCategory");
const todoImportance = document.getElementById("todoImportance");
const todoList = document.getElementById("todoList");
const categoryFilter = document.getElementById("categoryFilter");

const pomodoroDisplay = document.getElementById("pomodoroDisplay");
const pomodoroModeDisplay = document.getElementById("pomodoroMode");
const pomodoroStartBtn = document.getElementById("pomodoroStart");
const pomodoroResetBtn = document.getElementById("pomodoroReset");
const pomodoroSettingsBtn = document.getElementById("pomodoroSettings");
const progressCircle = document.getElementById("progress-circle");
const pomodoroSettingsModal = document.getElementById("pomodoroSettingsModal");
const workDurationInput = document.getElementById("workDuration");
const breakDurationInput = document.getElementById("breakDuration");
const saveSettingsBtn = document.getElementById("saveSettings");

const notificationBar = document.getElementById("notificationBar");
const notificationMessage = document.getElementById("notificationMessage");
const notificationClose = document.getElementById("notificationClose");

function saveClipboard(data) {
  clipboard = data;
  localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function saveTodos() {
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

function loadPomodoroSettings() {
  try {
    return JSON.parse(
      localStorage.getItem(POMODORO_SETTINGS_KEY) || '{"work":25,"break":5}'
    );
  } catch {
    return { work: 25, break: 5 };
  }
}

function savePomodoroSettings(settings) {
  localStorage.setItem(POMODORO_SETTINGS_KEY, JSON.stringify(settings));
}

function loadPomodoroStats() {
  try {
    return JSON.parse(
      localStorage.getItem(POMODORO_STATS_KEY) ||
        '{"today":0,"totalSeconds":0,"lastReset":""}'
    );
  } catch {
    return { today: 0, totalSeconds: 0, lastReset: "" };
  }
}

function savePomodoroStats(stats) {
  localStorage.setItem(POMODORO_STATS_KEY, JSON.stringify(stats));
}

function savePomodoroState() {
  const state = {
    timeLeft: pomodoroTimeLeft,
    mode: pomodoroMode,
    timestamp: Date.now(),
    totalStudySeconds: totalStudySeconds,
    isRunning: pomodoroRunning,
  };
  localStorage.setItem(POMODORO_STATE_KEY, JSON.stringify(state));
}

function loadPomodoroState() {
  const savedStateJSON = localStorage.getItem(POMODORO_STATE_KEY);
  if (!savedStateJSON) return;
  const savedState = JSON.parse(savedStateJSON);

  pomodoroMode = savedState.mode;
  totalStudySeconds = savedState.totalStudySeconds || 0;

  if (savedState.isRunning) {
    const timePassed = (Date.now() - savedState.timestamp) / 1000;
    if (savedState.timeLeft > timePassed) {
      pomodoroTimeLeft = savedState.timeLeft - timePassed;
      startPomodoro();
    } else {
      pomodoroTimeLeft = loadPomodoroSettings().work * 60;
    }
  } else {
    pomodoroTimeLeft = savedState.timeLeft;
  }

  if (pomodoroMode === "break") {
    pomodoroModeDisplay.textContent = "استراحت";
    pomodoroModeDisplay.classList.add("break");
    progressCircle.classList.add("break");
  } else {
    pomodoroModeDisplay.textContent = "کار";
    pomodoroModeDisplay.classList.remove("break");
    progressCircle.classList.remove("break");
  }

  localStorage.removeItem(POMODORO_STATE_KEY);
}

function fillCell(cell, subject, exam, room) {
  cell.querySelector(".subject").textContent = subject;
  cell.querySelector(".exam").textContent = `امتحان: ${exam}`;
  cell.querySelector(".room").textContent = `کلاس: ${room}`;
  cell.querySelector(".class-content").style.display = "flex";
  cell.querySelector(".add-class-btn").style.display = "none";
  cell.classList.add("has-class");
  makeDraggable(cell);
  addOverlay(cell);
  updateNotificationIconVisibility();
}

function clearCell(cell) {
  cell.querySelector(".subject").textContent = "";
  cell.querySelector(".exam").textContent = "";
  cell.querySelector(".room").textContent = "";
  cell.querySelector(".class-content").style.display = "none";
  cell.querySelector(".add-class-btn").style.display = "flex";
  cell.classList.remove("has-class");
  cell.draggable = false;
  cell.style.height = "";
  cell.style.width = "";
  cell.style.transform = "";
  removeOverlay(cell);
  removePasteButton(cell);
  updateNotificationIconVisibility();

  if (clipboard) {
    addPasteButton(cell);
  }
}

function addOverlay(cell) {
  removeOverlay(cell);
  cell.querySelectorAll(".delete-btn").forEach((b) => b.remove());
  if (!cell.classList.contains("has-class")) return;

  const overlay = document.createElement("div");
  overlay.className = "cell-overlay";

  const delBtn = document.createElement("button");
  delBtn.textContent = "حذف";
  delBtn.className = "ovl-btn del";
  delBtn.onclick = (e) => {
    e.stopPropagation();
    const key = `${cell.dataset.day}-${cell.dataset.time}`;
    const saved = loadFromStorage();
    delete saved[key];
    saveToStorage(saved);
    clearCell(cell);
  };

  const editBtn = document.createElement("button");
  editBtn.textContent = "ویرایش";
  editBtn.className = "ovl-btn edit";
  editBtn.onclick = (e) => {
    e.stopPropagation();
    currentCell = cell;
    const sub = cell.querySelector(".subject").textContent;
    const ex = cell.querySelector(".exam").textContent.replace("امتحان: ", "");
    const rm = cell.querySelector(".room").textContent.replace("کلاس: ", "");

    if (ex === "نامعلوم") {
      unknownExamCheckbox.checked = true;
      examDateInput.disabled = true;
      examDateInput.value = "";
    } else {
      unknownExamCheckbox.checked = false;
      examDateInput.disabled = false;
      examDateInput.value = ex;
    }

    if (rm === "نامعلوم") {
      unknownRoomCheckbox.checked = true;
      roomNumberInput.disabled = true;
      roomNumberInput.value = "";
    } else {
      unknownRoomCheckbox.checked = false;
      roomNumberInput.disabled = false;
      roomNumberInput.value = rm;
    }

    document.getElementById("subjectName").value = sub;
    document.querySelector('#classForm button[type="submit"]').textContent =
      "ویرایش";
    modal.style.display = "block";
  };

  const copyBtn = document.createElement("button");
  copyBtn.textContent = "کپی";
  copyBtn.className = "ovl-btn copy";
  copyBtn.onclick = (e) => {
    e.stopPropagation();
    const sub = cell.querySelector(".subject").textContent;
    const ex = cell.querySelector(".exam").textContent.replace("امتحان: ", "");
    const rm = cell.querySelector(".room").textContent.replace("کلاس: ", "");
    saveClipboard({ subject: sub, exam: ex, room: rm });
    copyBtn.textContent = "✓";
    setTimeout(() => (copyBtn.textContent = "کپی"), 1000);
    document
      .querySelectorAll(".class-cell:not(.has-class)")
      .forEach(addPasteButton);
  };

  overlay.append(delBtn, editBtn, copyBtn);
  cell.append(overlay);
}

function removeOverlay(cell) {
  cell.querySelectorAll(".cell-overlay").forEach((o) => o.remove());
}

function addPasteButton(cell) {
  if (cell.classList.contains("has-class")) return;
  if (cell.querySelector(".paste-empty-btn")) return;
  if (!clipboard) return;
  const pasteBtn = document.createElement("button");
  pasteBtn.textContent = "الصاق";
  pasteBtn.className = "paste-empty-btn";
  pasteBtn.onclick = (e) => {
    e.stopPropagation();
    fillCell(cell, clipboard.subject, clipboard.exam, clipboard.room);
    const key = `${cell.dataset.day}-${cell.dataset.time}`;
    const saved = loadFromStorage();
    saved[key] = { ...clipboard };
    saveToStorage(saved);
  };
  cell.append(pasteBtn);
}

function removePasteButton(cell) {
  cell.querySelectorAll(".paste-empty-btn").forEach((b) => b.remove());
}

function makeDraggable(cell) {
  cell.draggable = true;
  cell.addEventListener("dragstart", (e) => {
    const key = `${cell.dataset.day}-${cell.dataset.time}`;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", key);
    cell.style.opacity = "0.4";
  });
  cell.addEventListener("dragend", () => (cell.style.opacity = ""));
}

function renderSavedClasses() {
  const saved = loadFromStorage();
  document.querySelectorAll(".class-cell").forEach((cell) => {
    const key = `${cell.dataset.day}-${cell.dataset.time}`;
    const info = saved[key];
    if (info?.subject) fillCell(cell, info.subject, info.exam, info.room);
  });
}

function loadAndApplyCustomTimeSlots() {
  const savedTimesJSON = localStorage.getItem(TIME_SLOTS_KEY);
  if (!savedTimesJSON) return;

  try {
    const savedTimes = JSON.parse(savedTimesJSON);
    const headers = document.querySelectorAll(
      ".time-header-cell:not(:first-child)"
    );

    if (Array.isArray(savedTimes) && savedTimes.length === headers.length) {
      headers.forEach((th, index) => {
        const newTime = savedTimes[index];
        th.querySelector("span").textContent = newTime;

        const colIndex = index + 1;
        document.querySelectorAll(".schedule-table tbody tr").forEach((row) => {
          const cell = row.children[colIndex];
          if (cell) {
            cell.dataset.time = newTime;
          }
        });
      });
    }
  } catch (e) {
    console.error("Failed to parse or apply custom time slots:", e);
    localStorage.removeItem(TIME_SLOTS_KEY);
  }
}

function updateTimeSlot(thElement, oldTime, newTime) {
  const colIndex = Array.from(thElement.parentNode.children).indexOf(thElement);

  document.querySelectorAll(".schedule-table tbody tr").forEach((row) => {
    const cell = row.children[colIndex];
    if (cell && cell.classList.contains("class-cell")) {
      cell.dataset.time = newTime;
    }
  });

  const saved = loadFromStorage();
  const updatedData = {};
  for (const key in saved) {
    const firstHyphenIndex = key.indexOf("-");
    if (firstHyphenIndex > -1) {
      const day = key.substring(0, firstHyphenIndex);
      const time = key.substring(firstHyphenIndex + 1);
      if (time === oldTime) {
        const newKey = `${day}-${newTime}`;
        updatedData[newKey] = saved[key];
      } else {
        updatedData[key] = saved[key];
      }
    } else {
      updatedData[key] = saved[key];
    }
  }
  saveToStorage(updatedData);

  const allCurrentTimes = Array.from(
    document.querySelectorAll(".time-header-cell:not(:first-child) span")
  ).map((span) => span.textContent);
  localStorage.setItem(TIME_SLOTS_KEY, JSON.stringify(allCurrentTimes));

  showNotification(
    "زمان ویرایش شد",
    `ساعت "${oldTime}" به "${newTime}" تغییر کرد.`
  );
}

const closeModal = () => {
  modal.style.display = "none";
  form.reset();
  examDateInput.disabled = false;
  roomNumberInput.disabled = false;
  submitBtn.textContent = "افزودن درس";
};

function formatDateTime() {
  const now = new Date();
  const options = { weekday: "long", hour: "2-digit", minute: "2-digit" };
  const persianDate = now.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("fa-IR", options);
  return `${persianDate} - ${timeStr}`;
}

function createRipple(event, element) {
  const ripple = document.createElement("span");
  ripple.classList.add("ripple");

  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = x + "px";
  ripple.style.top = y + "px";

  element.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

function createProgressFill(element) {
  const progressFill = document.createElement("div");
  progressFill.classList.add("todo-item-fill");
  element.appendChild(progressFill);

  setTimeout(() => {
    progressFill.style.width = "100%";
  }, 10);

  setTimeout(() => {
    progressFill.remove();
  }, 500);
}

function emptyTodos() {
  if (todos.length === 0) {
    document
      .querySelector(".empty-todo")
      .classList.remove("empty-todo-invisible");
  } else {
    document.querySelector(".empty-todo").classList.add("empty-todo-invisible");
  }
}

function filterTodos() {
  return todos.filter((todo) => {
    const statusMatch =
      currentFilter === "all" ||
      (currentFilter === "completed" && todo.done) ||
      (currentFilter === "active" && !todo.done);
    const categoryMatch =
      currentCategory === "all" || todo.category === currentCategory;
    return statusMatch && categoryMatch;
  });
}

function getImportanceText(importance) {
  const importanceMap = {
    low: "کم",
    medium: "متوسط",
    high: "زیاد",
    critical: "خیلی زیاد",
  };
  return importanceMap[importance] || "متوسط";
}

function getCategoryText(category) {
  const categoryMap = {
    work: "کار",
    study: "تحصیلی",
    personal: "شخصی",
    shopping: "خرید",
  };
  return categoryMap[category] || "شخصی";
}

function renderTodos() {
  todoList.innerHTML = "";
  const filteredTodos = filterTodos();

  filteredTodos.forEach((todo) => {
    const originalIndex = todos.indexOf(todo);
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " done" : "");

    const importanceTag = document.createElement("div");
    importanceTag.className = `importance-tag importance-${
      todo.importance || "medium"
    }`;
    importanceTag.textContent = getImportanceText(todo.importance || "medium");

    const categoryTag = document.createElement("div");
    categoryTag.className = "category-tag";
    categoryTag.textContent = getCategoryText(todo.category || "personal");

    if (currentEditIndex === originalIndex) {
      li.innerHTML = `
        <div class="todo-content">
          <div class="todo-main">
            <div class="todo-edit-actions">
              <button class="todo-save-btn">✓</button>
              <button class="todo-cancel-btn">×</button>
            </div>
            <input type="text" class="todo-edit-input" value="${todo.text}" />
            <select class="todo-select" id="editCategory">
              <option value="work" ${
                todo.category === "work" ? "selected" : ""
              }>کار</option>
              <option value="study" ${
                todo.category === "study" ? "selected" : ""
              }>تحصیلی</option>
              <option value="personal" ${
                todo.category === "personal" ? "selected" : ""
              }>شخصی</option>
              <option value="shopping" ${
                todo.category === "shopping" ? "selected" : ""
              }>خرید</option>
            </select>
            <select class="todo-select" id="editImportance">
              <option value="low" ${
                todo.importance === "low" ? "selected" : ""
              }>کم</option>
              <option value="medium" ${
                todo.importance === "medium" ? "selected" : ""
              }>متوسط</option>
              <option value="high" ${
                todo.importance === "high" ? "selected" : ""
              }>زیاد</option>
              <option value="critical" ${
                todo.importance === "critical" ? "selected" : ""
              }>خیلی زیاد</option>
            </select>
          </div>
          <div class="todo-meta">${todo.addedDate || ""}</div>
        </div>`;
      const input = li.querySelector(".todo-edit-input");
      input.focus();
      input.select();

      li.querySelector(".todo-save-btn").onclick = () => {
        const newText = input.value.trim();
        const newCategory = li.querySelector("#editCategory").value;
        const newImportance = li.querySelector("#editImportance").value;
        if (newText) {
          todos[originalIndex] = {
            ...todos[originalIndex],
            text: newText,
            category: newCategory,
            importance: newImportance,
          };
          saveTodos();
        }
        currentEditIndex = -1;
        renderTodos();
      };
      li.querySelector(".todo-cancel-btn").onclick = () => {
        currentEditIndex = -1;
        renderTodos();
      };
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") li.querySelector(".todo-save-btn").click();
        else if (e.key === "Escape")
          li.querySelector(".todo-cancel-btn").click();
      });
    } else {
      li.innerHTML = `
        <div class="todo-content">
          <div class="todo-main">
            <span class="todo-text" title="${todo.text}">${todo.text}</span>
          </div>
          <div class="todo-meta">${todo.addedDate || ""}</div>
        </div>
        <div class="todo-overlay">
          <button class="ovl-todo ${todo.done ? "undone" : "done"}" title="${
        todo.done ? "انجام نشد" : "انجام شد"
      }">${todo.done ? "↶" : "✓"}</button>
          ${
            !todo.done
              ? '<button class="ovl-todo edit" title="ویرایش">&#9998;</button>'
              : ""
          }
          <button class="ovl-todo delete" title="حذف">&times;</button>
        </div>`;

      const toggleDone = (e) => {
        createRipple(e, li);
        createProgressFill(li);
        li.classList.add("completing");
        todo.done = !todo.done;
        setTimeout(() => {
          li.classList.toggle("done");
          li.classList.remove("completing");
          saveTodos();
          renderTodos();
        }, 500);
      };

      li.querySelector(".todo-text").onclick = toggleDone;
      li.querySelector(".ovl-todo.done, .ovl-todo.undone").onclick = (e) => {
        e.stopPropagation();
        toggleDone(e);
      };

      const editBtn = li.querySelector(".ovl-todo.edit");
      if (editBtn) {
        editBtn.onclick = () => {
          currentEditIndex = originalIndex;
          renderTodos();
        };
      }

      li.querySelector(".ovl-todo.delete").onclick = (event) => {
        if (confirm("حذف شود؟")) {
          createRipple(event, li);
          setTimeout(() => {
            todos.splice(originalIndex, 1);
            saveTodos();
            renderTodos();
          }, 500);
        }
      };
    }
    li.appendChild(importanceTag);
    li.appendChild(categoryTag);
    todoList.appendChild(li);
  });
  emptyTodos();
}

function initializeStudyTime() {
  const stats = loadPomodoroStats();
  totalStudySeconds = stats.totalSeconds || 0;
}

function updatePomodoroStats() {
  const stats = loadPomodoroStats();
  document.getElementById("todayPomodoros").textContent = stats.today;
  const totalSeconds = stats.totalSeconds || 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  document.getElementById("todayMinutes").textContent = formattedTime;

  document
    .getElementById("achievement1")
    .classList.toggle("earned", stats.today >= 4);
  document
    .getElementById("achievement2")
    .classList.toggle("earned", stats.today >= 8);
  document
    .getElementById("achievement3")
    .classList.toggle("earned", stats.today >= 12);
}

function resetDailyStats() {
  const stats = loadPomodoroStats();
  const today = new Date().toLocaleDateString("fa-IR");
  if (stats.lastReset !== today) {
    stats.today = 0;
    stats.totalSeconds = 0;
    stats.lastReset = today;
    savePomodoroStats(stats);
    totalStudySeconds = 0;
    studySeconds = 0;
    updatePomodoroStats();
    showNotification("روز جدید", "آمار مطالعه امروز ریست شد.");
  }
}

function clearPomodoroStats() {
  if (confirm("آیا از پاک کردن تمام آمار مطالعه مطمئن هستید؟")) {
    const stats = {
      today: 0,
      totalSeconds: 0,
      lastReset: new Date().toLocaleDateString("fa-IR"),
    };
    savePomodoroStats(stats);
    initializeStudyTime();
    updatePomodoroStats();
    showNotification("آمار پاک شد", "تمام آمار مطالعه پاک شد.");
  }
}

function updatePomodoroDisplay() {
  const minutes = Math.floor(pomodoroTimeLeft / 60);
  const seconds = Math.floor(pomodoroTimeLeft % 60);
  pomodoroDisplay.textContent = `${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const totalTime =
    (pomodoroMode === "work"
      ? loadPomodoroSettings().work
      : loadPomodoroSettings().break) * 60;
  const progress = (totalTime - pomodoroTimeLeft) / totalTime;
  progressCircle.style.strokeDashoffset =
    circumference - progress * circumference;
}

function startPomodoro() {
  if (pomodoroRunning) return;
  pomodoroRunning = true;
  pomodoroStartBtn.title = "توقف تایمر";
  pomodoroStartBtn.innerHTML =
    '<svg style="width: 34px; height:34px; text-align: center;" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clip-rule="evenodd" /></svg><span class="pomodoro-tooltip">توقف تایمر</span>';

  pomodoroInterval = setInterval(() => {
    if (pomodoroRunning) {
      pomodoroTimeLeft--;
      if (pomodoroMode === "work") {
        totalStudySeconds++;
        const stats = loadPomodoroStats();
        stats.totalSeconds = totalStudySeconds;
        savePomodoroStats(stats);
        updatePomodoroStats();
      }
    }
    updatePomodoroDisplay();

    if (pomodoroTimeLeft < 1) {
      clearInterval(pomodoroInterval);
      pomodoroRunning = false;
      pomodoroStartBtn.title = "شروع تایمر";
      pomodoroStartBtn.innerHTML =
        '<svg style="width: 34px; height: 34px; text-align: center" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd"></path></svg><span class="pomodoro-tooltip">شروع تایمر</span>';
      localStorage.removeItem(POMODORO_STATE_KEY);

      if (pomodoroMode === "work") {
        const stats = loadPomodoroStats();
        stats.today++;
        stats.totalSeconds = totalStudySeconds;
        savePomodoroStats(stats);
        updatePomodoroStats();
        consecutiveWorkSessions++;
        if (consecutiveWorkSessions >= 4) {
          showNotification("وقت استراحت بلندتره", "🍵 برو یه چایی بخور!");
          consecutiveWorkSessions = 0;
        }
        pomodoroMode = "break";
        pomodoroTimeLeft = loadPomodoroSettings().break * 60;
        pomodoroModeDisplay.textContent = "استراحت";
        pomodoroModeDisplay.classList.add("break");
        progressCircle.classList.add("break");
        showNotification("زمان استراحت", "وقتشه یه کم استراحت کنی!");
      } else {
        pomodoroMode = "work";
        pomodoroTimeLeft = loadPomodoroSettings().work * 60;
        pomodoroModeDisplay.textContent = "کار";
        pomodoroModeDisplay.classList.remove("break");
        progressCircle.classList.remove("break");
        showNotification("زمان کار!", "زمان شروع دور بعدی کار است");
      }
      updatePomodoroDisplay();
    }
  }, 1000);
}

function stopPomodoro() {
  if (!pomodoroRunning) return;
  clearInterval(pomodoroInterval);
  pomodoroRunning = false;
  pomodoroStartBtn.title = "شروع تایمر";
  pomodoroStartBtn.innerHTML =
    '<svg style="width: 34px; height: 34px; text-align: center" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd"></path></svg><span class="pomodoro-tooltip">شروع تایمر</span>';

  savePomodoroState();

  const stats = loadPomodoroStats();
  stats.totalSeconds = totalStudySeconds;
  savePomodoroStats(stats);
  updatePomodoroStats();
}

function resetPomodoro() {
  clearInterval(pomodoroInterval);
  pomodoroRunning = false;
  localStorage.removeItem(POMODORO_STATE_KEY);
  pomodoroMode = "work";
  pomodoroTimeLeft = loadPomodoroSettings().work * 60;
  pomodoroModeDisplay.textContent = "کار";
  pomodoroModeDisplay.classList.remove("break");
  progressCircle.classList.remove("break");
  updatePomodoroDisplay();
  pomodoroStartBtn.innerHTML =
    '<svg style="width: 34px; height: 34px; text-align: center" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd"></path></svg><span class="pomodoro-tooltip">شروع تایمر</span>';
}

function showNotification(title, message) {
  notificationMessage.textContent = `${title}: ${message}`;
  notificationBar.classList.add("show");
  setTimeout(() => notificationBar.classList.remove("show"), 5000);
}

function updateDateTime() {
  const now = new Date();
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  document.getElementById("datetimeDisplay").textContent =
    now.toLocaleDateString("fa-IR", options);
}

function toEnDigit(s) {
  if (typeof s !== "string") return s;
  return s.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
}

function parseTimeToMinutes(timeStr) {
  const cleanedStr = toEnDigit(timeStr.trim());
  const parts = cleanedStr.split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  if (isNaN(hours) || isNaN(minutes)) return NaN;
  return hours * 60 + minutes;
}

function parseTimeRange(timeRangeStr) {
  const parts = timeRangeStr.split("-").map((p) => p.trim());
  if (parts.length !== 2) return null;

  const start = parseTimeToMinutes(parts[0]);
  const end = parseTimeToMinutes(parts[1]);

  if (isNaN(start) || isNaN(end)) return null;

  return { start, end };
}

function getCurrentTimeSlot() {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const timeHeaders = document.querySelectorAll(
    ".time-header-cell:not(:first-child) span"
  );

  for (const header of timeHeaders) {
    const timeText = header.textContent;
    const slot = parseTimeRange(timeText);

    if (slot && currentTime >= slot.start && currentTime < slot.end) {
      return timeText;
    }
  }

  return null;
}

function getPersianDay() {
  const days = [
    "یک‌شنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه",
    "شنبه",
  ];
  const dayIndex = new Date().getDay();
  return days[dayIndex];
}

function hasClassInCurrentTimeSlot() {
  const currentDay = getPersianDay();
  const currentTimeSlot = getCurrentTimeSlot();
  if (!currentTimeSlot) return false;
  const classInfo = loadFromStorage()[`${currentDay}-${currentTimeSlot}`];
  return !!(classInfo && classInfo.subject);
}

function updateNotificationIconVisibility() {
  const notificationIcon = document.getElementById("notificationIcon");
  notificationIcon.style.display = hasClassInCurrentTimeSlot()
    ? "flex"
    : "none";
}

function showClassNotification() {
  const currentDay = getPersianDay();
  const currentTimeSlot = getCurrentTimeSlot();
  if (!currentTimeSlot) return;
  const classInfo = loadFromStorage()[`${currentDay}-${currentTimeSlot}`];
  if (classInfo && classInfo.subject) {
    showNotification(
      "یادآوری کلاس",
      `شما کلاس ${classInfo.subject} در کلاس ${classInfo.room} دارید`
    );
  }
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top <=
      (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
    rect.bottom >= 0
  );
}

function checkVisibility() {
  document
    .querySelectorAll(
      ".fade-in, .schedule-wrapper, .todo-sidebar, .pomodoro-container, .pomodoro-stats"
    )
    .forEach((element) => {
      if (isInViewport(element)) element.classList.add("visible");
    });
}

function addEditTimeSlotListeners() {
  document.querySelectorAll(".edit-time-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      currentThElement = e.target.closest(".time-header-cell");
      const span = currentThElement.querySelector("span");
      const currentTime = span.textContent.trim();
      const [start, end] = currentTime.split(" - ");

      startTimeInput.value = start ? start.trim() : "";
      endTimeInput.value = end ? end.trim() : "";

      timeModal.style.display = "block";
      startTimeInput.focus();
    });
  });
}

async function downloadScheduleAsPDF() {
  const { jsPDF } = window.jspdf; 

  const table = document.querySelector('.schedule-table');
  
  table.classList.add('pdf-export');
  
  try {
    const canvas = await html2canvas(table, {
      scale: 1.5, 
      useCORS: true, 
      backgroundColor: 'black',
    });

    const imgData = canvas.toDataURL('image/png',0.7);    
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let positionY = 10; 

    pdf.addImage(imgData, 'PNG', 10, positionY, imgWidth, imgHeight);
    heightLeft -= pdfHeight - 20; 
    
    while (heightLeft > 0) {
      pdf.addPage();
      positionY = heightLeft - imgHeight + 10; 
      pdf.addImage(imgData, 'PNG', 10, positionY, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;
    }
    
    pdf.save('برنامه هفتگی.pdf');
    
    showNotification('دانلود موفق', 'برنامه هفتگی به صورت PDF دانلود شد!');
  } catch (error) {
    console.error('خطا در تولید PDF:', error);
    showNotification('خطا', 'مشکلی در تولید PDF رخ داد. لطفاً دوباره امتحان کنید.');
  } finally {
    table.classList.remove('pdf-export');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('downloadPDF').addEventListener('click', downloadScheduleAsPDF);
});

document.addEventListener("DOMContentLoaded", () => {
  loadAndApplyCustomTimeSlots();
  renderSavedClasses();

  document.querySelectorAll(".class-cell").forEach((c) => {
    addOverlay(c);
    addPasteButton(c);
    c.addEventListener(
      "mouseenter",
      () => (c.style.transform = "translateY(-2px)")
    );
    c.addEventListener(
      "mouseleave",
      () => (c.style.transform = "translateY(0)")
    );
  });

  document.querySelectorAll(".add-class-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentCell = btn.closest(".class-cell");
      submitBtn.textContent = "افزودن درس";
      modal.style.display = "block";
    });
  });

  document.querySelectorAll(".class-cell").forEach((target) => {
    target.addEventListener("dragover", (e) => {
      if (target.classList.contains("class-cell")) {
        e.preventDefault();
        target.style.background = "rgba(52,152,219,0.3)";
      }
    });
    target.addEventListener("dragleave", () => (target.style.background = ""));
    target.addEventListener("drop", (e) => {
      e.preventDefault();
      target.style.background = "";
      const srcKey = e.dataTransfer.getData("text/plain");
      const srcCell = document.querySelector(
        `[data-day="${srcKey.split("-")[0]}"][data-time="${srcKey
          .split("-")
          .slice(1)
          .join("-")}"]`
      );
      if (!srcCell || srcCell === target) return;

      const saved = loadFromStorage();
      const data = saved[srcKey];
      if (!data) return;

      delete saved[srcKey];
      clearCell(srcCell);
      const dstKey = `${target.dataset.day}-${target.dataset.time}`;
      saved[dstKey] = data;
      fillCell(target, data.subject, data.exam, data.room);
      saveToStorage(saved);

      updateNotificationIconVisibility();
    });
  });

  document
    .querySelectorAll(".schedule-table tbody tr")
    .forEach((row, index) => {
      row.style.transitionDelay = `${index * 0.1}s`;
    });

  const welcomeModal = document.getElementById("welcomeModal");
  const welcomeModalClose = document.getElementById("welcomeModalClose");

  if (!localStorage.getItem(WELCOME_KEY)) {
    welcomeModal.style.display = "block";
    localStorage.setItem(WELCOME_KEY, "true");
  }

  localStorage.setItem(WELCOME_KEY, "true");

  welcomeModalClose.onclick = function () {
    welcomeModal.style.display = "none";
  };
  window.addEventListener("click", function (event) {
    if (event.target == welcomeModal) {
      welcomeModal.style.display = "none";
    }
  });

  addEditTimeSlotListeners();
  setTimeout(checkVisibility, 100);

  saveTimeBtn.addEventListener("click", () => {
    const newStart = startTimeInput.value.trim();
    const newEnd = endTimeInput.value.trim();

    if (newStart && newEnd && currentThElement) {
      const oldTime = currentThElement.querySelector("span").textContent;
      const newTime = `${newStart} - ${newEnd}`;

      if (oldTime !== newTime) {
        currentThElement.querySelector("span").textContent = newTime;
        updateTimeSlot(currentThElement, oldTime, newTime);
      }
      timeModal.style.display = "none";
    } else {
      alert("لطفا هر دو زمان شروع و پایان را وارد کنید.");
    }
  });

  timeModalCloseBtn.onclick = () => {
    timeModal.style.display = "none";
  };
});

window.addEventListener("load", () => {
  if (!localStorage.getItem(FIRST_VISIT_KEY)) {
    localStorage.setItem(FIRST_VISIT_KEY, "true");
    setTimeout(showClassNotification, 2000);
  }
  setInterval(showClassNotification, 60000);
  showClassNotification();
  updateNotificationIconVisibility();
  renderTodos();
});

window.addEventListener("beforeunload", savePomodoroState);
window.addEventListener("scroll", () => {
  if (!scrollTimeout) {
    scrollTimeout = setTimeout(() => {
      checkVisibility();
      scrollTimeout = null;
    }, 50);
  }
});
window.addEventListener("resize", checkVisibility);
window.onclick = (e) => {
  if (e.target === modal || e.target === timeModal) {
    closeModal();
    timeModal.style.display = "none";
  }
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentCell) return;
  const subject = form.subjectName.value.trim();
  let exam, room;

  if (unknownExamCheckbox.checked) {
    exam = "نامعلوم";
  } else {
    exam = form.examDate.value.trim();
  }

  if (unknownRoomCheckbox.checked) {
    room = "نامعلوم";
  } else {
    room = form.roomNumber.value.trim();
  }

  if (
    subject &&
    (unknownExamCheckbox.checked || exam) &&
    (unknownRoomCheckbox.checked || room)
  ) {
    fillCell(currentCell, subject, exam, room);
    const key = `${currentCell.dataset.day}-${currentCell.dataset.time}`;
    const saved = loadFromStorage();
    saved[key] = { subject, exam, room };
    saveToStorage(saved);
    closeModal();
  }
});

unknownExamCheckbox.addEventListener("change", () => {
  examDateInput.disabled = unknownExamCheckbox.checked;
  if (unknownExamCheckbox.checked) {
    examDateInput.value = "";
  }
});
unknownRoomCheckbox.addEventListener("change", () => {
  roomNumberInput.disabled = unknownRoomCheckbox.checked;
  if (unknownRoomCheckbox.checked) {
    roomNumberInput.value = "";
  }
});
document.querySelector("#classModal .close").onclick = closeModal;

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  todos.push({
    text,
    done: false,
    addedDate: formatDateTime(),
    category: todoCategory.value,
    importance: todoImportance.value,
  });
  saveTodos();
  renderTodos();
  todoInput.value = "";
});
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active").classList.remove("active");
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});
categoryFilter.addEventListener("change", (e) => {
  currentCategory = e.target.value;
  renderTodos();
});
document
  .querySelector(".clear-todo-btn")
  .addEventListener("click", function () {
    if (confirm("آیا از پاک کردن تمام کارها مطمئن هستید؟")) {
      todos = [];
      saveTodos();
      renderTodos();
      showNotification("پاکسازی کارها", "تمام کارها با موفقیت پاک شدند");
    }
  });

pomodoroStartBtn.addEventListener("click", () => {
  pomodoroRunning ? stopPomodoro() : startPomodoro();
});
pomodoroResetBtn.addEventListener("click", resetPomodoro);
document
  .getElementById("clearStatsBtn")
  .addEventListener("click", clearPomodoroStats);
pomodoroSettingsBtn.addEventListener("click", () => {
  const settings = loadPomodoroSettings();
  workDurationInput.value = settings.work;
  breakDurationInput.value = settings.break;
  pomodoroSettingsModal.style.display = "block";
});
document.querySelector("#pomodoroSettingsModal .close").onclick = () =>
  (pomodoroSettingsModal.style.display = "none");
document.getElementById("cancelSettings").onclick = () =>
  (pomodoroSettingsModal.style.display = "none");
saveSettingsBtn.addEventListener("click", () => {
  const workDuration = parseInt(workDurationInput.value);
  const breakDuration = parseInt(breakDurationInput.value);
  if (workDuration > 0 && breakDuration > 0) {
    savePomodoroSettings({ work: workDuration, break: breakDuration });
    resetPomodoro();
    pomodoroSettingsModal.style.display = "none";
    showNotification("تنظیمات ذخیره شد", "زمان‌های جدید اعمال شدند");
  }
});
notificationClose.addEventListener("click", () =>
  notificationBar.classList.remove("show")
);
document
  .getElementById("notificationIcon")
  .addEventListener("click", showClassNotification);

updateDateTime();
setInterval(updateDateTime, 1000);
progressCircle.style.strokeDasharray = circumference;
resetDailyStats();
initializeStudyTime();
loadPomodoroState();
updatePomodoroDisplay();
updatePomodoroStats();
