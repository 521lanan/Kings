// 必须登录
if(localStorage.getItem("login") !== "1"){
  location = "index.html"
}

let questions = []
let current = Number(localStorage.getItem("current") || 0)
let finished = Number(localStorage.getItem("finished") || 0)

let answered = false

const quizEl = document.getElementById("quiz")
const barEl = document.getElementById("bar")
const progressTextEl = document.getElementById("progressText")
const percentTextEl = document.getElementById("percentText")
const nextBtn = document.getElementById("nextBtn")

fetch("questions.xlsx")
  .then(res => {
    if(!res.ok) throw new Error("questions.xlsx 加载失败")
    return res.arrayBuffer()
  })
  .then(data => {
    const wb = XLSX.read(data,{type:"array"})
    const sheet = wb.Sheets[wb.SheetNames[0]]
    questions = XLSX.utils.sheet_to_json(sheet)

    // 防止本地进度大于题数
    if(current > questions.length) current = questions.length
    if(finished > questions.length) finished = questions.length

    show()
  })
  .catch(() => {
    quizEl.innerHTML = `<h3>题库读取失败</h3><div class="muted">请确认 questions.xlsx 在仓库根目录，且列名包含 question/A/B/C/D/answer/explain</div>`
  })

function updateProgress(){
  const total = questions.length || 0
  const done = Math.min(finished, total)
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  progressTextEl.innerText = `进度：${done}/${total}`
  percentTextEl.innerText = `${percent}%`
  barEl.style.width = percent + "%"
}

function show(){
  if(current >= questions.length){
    // 全部完成
    location = "finish.html"
    return
  }

  const q = questions[current]
  answered = false
  nextBtn.disabled = true

  const idx = current + 1
  const total = questions.length

  quizEl.innerHTML = `
    <div class="muted">第 <b>${idx}</b> / ${total} 题</div>
    <h3>${q.question}</h3>

    <button class="option" onclick="check('A')">A. ${q.A}</button>
    <button class="option" onclick="check('B')">B. ${q.B}</button>
    <button class="option" onclick="check('C')">C. ${q.C}</button>
    <button class="option" onclick="check('D')">D. ${q.D}</button>

    <div id="result" class="result"></div>
    <div id="explain" class="explain" style="display:none;"></div>
  `

  updateProgress()
}

function check(choice){
  const q = questions[current]
  const correct = String(q.answer).trim().toUpperCase()

  const resultEl = document.getElementById("result")
  const explainEl = document.getElementById("explain")

  const ok = choice === correct

  resultEl.className = "result " + (ok ? "ok" : "no")
  resultEl.innerText = ok ? "✅ 正确" : `❌ 错误（正确答案：${correct}）`

  explainEl.style.display = "block"
  explainEl.innerText = "解析： " + (q.explain ?? "")

  answered = true
  nextBtn.disabled = false
}

function next(){
  if(!answered){
    alert("请先选择答案查看解析，再进入下一题")
    return
  }

  current += 1
  finished += 1

  localStorage.setItem("current", String(current))
  localStorage.setItem("finished", String(finished))

  show()
}

function restartProgress(){
  // 保留登录，只清进度
  current = 0
  finished = 0
  localStorage.setItem("current","0")
  localStorage.setItem("finished","0")
  show()
}

function logout(){
  localStorage.removeItem("login")
  localStorage.removeItem("current")
  localStorage.removeItem("finished")
  location = "index.html"
}
