// 必须登录
if (localStorage.getItem("login") !== "1") {
  location = "index.html";
}

let questions = [];
let current = Number(localStorage.getItem("current") || 0);
let finished = Number(localStorage.getItem("finished") || 0);

let answered = false;          // 是否已提交
let locked = false;            // 提交后锁定选项
let selectedChoice = null;     // 当前选中的选项

const quizEl = document.getElementById("quiz");
const barEl = document.getElementById("bar");
const progressTextEl = document.getElementById("progressText");
const percentTextEl = document.getElementById("percentText");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");

fetch("./questions.xlsx?v=" + Date.now(), { cache: "no-store" })  // 使用强制刷新，避免浏览器缓存
  .then(res => {
    if (!res.ok) throw new Error("questions.xlsx 加载失败");
    return res.arrayBuffer();
  })
  .then(data => {
    const wb = XLSX.read(data, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    questions = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // 防止本地进度大于题数
    if (current > questions.length) current = questions.length;
    if (finished > questions.length) finished = questions.length;

    show();
  })
  .catch(err => {
    quizEl.innerHTML = `<h3>题库读取失败</h3><div class="muted">${err.message}</div>`;
  });

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function updateProgress() {
  const total = questions.length || 0;
  const done = Math.min(finished, total);
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  progressTextEl.innerText = `进度：${done}/${total}`;
  percentTextEl.innerText = `${percent}%`;
  barEl.style.width = percent + "%";
}

function show() {
  if (current >= questions.length) {
    location = "finish.html";
    return;
  }

  const q = questions[current];
  answered = false;
  locked = false;
  selectedChoice = null;

  nextBtn.disabled = true;     // 未提交前不能下一题
  submitBtn.disabled = true;   // 未选中前不能提交

  const idx = current + 1;
  const total = questions.length;

  quizEl.innerHTML = `
    <div class="muted">第 <b>${idx}</b> / ${total} 题</div>
    <h3>${escapeHtml(q.question)}</h3>

    <button class="option" data-choice="A" onclick="selectOption('A')">A. ${escapeHtml(q.A)}</button>
    <button class="option" data-choice="B" onclick="selectOption('B')">B. ${escapeHtml(q.B)}</button>
    <button class="option" data-choice="C" onclick="selectOption('C')">C. ${escapeHtml(q.C)}</button>
    <button class="option" data-choice="D" onclick="selectOption('D')">D. ${escapeHtml(q.D)}</button>

    <div id="result" class="result"></div>
    <div id="explain" class="explain" style="display:none;"></div>
  `;

  updateProgress();
}

// 第一步：只选中，不提交
function selectOption(choice) {
  if (locked) return;

  selectedChoice = choice;
  submitBtn.disabled = false; // 选中后可以提交

  document.querySelectorAll(".option").forEach(btn => {
    btn.classList.remove("is-selected");
  });

  const btn = document.querySelector(`.option[data-choice="${choice}"]`);
  if (btn) btn.classList.add("is-selected");
}

function lockOptions() {
  locked = true;
  document.querySelectorAll(".option").forEach(btn => {
    btn.classList.add("is-locked");
  });
}

// 提交后：正确/错误样式反馈
function markAfterSubmit(picked, correct) {
  const optionBtns = document.querySelectorAll(".option");

  optionBtns.forEach(btn => {
    btn.classList.remove("is-correct", "is-wrong");
    btn.classList.add("is-dim");
  });

  // 正确答案标绿
  const correctBtn = document.querySelector(`.option[data-choice="${correct}"]`);
  if (correctBtn) {
    correctBtn.classList.remove("is-dim");
    correctBtn.classList.add("is-correct");
  }

  // 用户选择标红/标绿
  const pickedBtn = document.querySelector(`.option[data-choice="${picked}"]`);
  if (pickedBtn) {
    pickedBtn.classList.remove("is-dim");
    pickedBtn.classList.add("is-selected");
    if (picked === correct) {
      pickedBtn.classList.add("is-correct");
    } else {
      pickedBtn.classList.add("is-wrong");
    }
  }
}

// 第二步：点击提交按钮才判题并显示解析
function submitAnswer() {
  if (locked) return;

  if (!selectedChoice) {
    alert("请先选择一个选项再提交");
    return;
  }

  const q = questions[current];
  const correct = String(q.answer ?? "").trim().toUpperCase();

  const resultEl = document.getElementById("result");
  const explainEl = document.getElementById("explain");

  lockOptions();
  submitBtn.disabled = true; // 提交后不能再提交

  // 若答案为空：也显示解析
  if (!correct) {
    resultEl.className = "result";
    resultEl.innerText = "✅ 已提交（本题暂未设置答案）";

    explainEl.style.display = "block";
    explainEl.innerText = "解析： " + (q.explain ?? "");

    answered = true;
    nextBtn.disabled = false;
    return;
  }

  // 正确/错误反馈
  markAfterSubmit(selectedChoice, correct);

  const ok = selectedChoice === correct;
  resultEl.className = "result " + (ok ? "ok" : "no");
  resultEl.innerText = ok ? "✅ 正确" : `❌ 错误（正确答案：${correct}）`;

  explainEl.style.display = "block";
  explainEl.innerText = "解析： " + (q.explain ?? "");

  answered = true;
  nextBtn.disabled = false;
}

// 第三步：下一题
function next() {
  if (!answered) {
    alert("请先提交答案查看解析，再进入下一题");
    return;
  }

  current += 1;
  finished += 1;

  localStorage.setItem("current", String(current));
  localStorage.setItem("finished", String(finished));

  show();
}

function restartProgress() {
  // 保留登录，只清进度
  current = 0;
  finished = 0;
  localStorage.setItem("current", "0");
  localStorage.setItem("finished", "0");
  show();
}

function logout() {
  localStorage.removeItem("login");
  localStorage.removeItem("current");
  localStorage.removeItem("finished");
  location = "index.html";
}
