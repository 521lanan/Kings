let users = []
const msgEl = document.getElementById("msg")
const btnEl = document.getElementById("loginBtn")

msgEl.innerText = "正在加载账号数据..."
btnEl.disabled = true

fetch("./users.xlsx", { cache: "no-store" })
  .then(res => {
    if(!res.ok){
      throw new Error(`users.xlsx 请求失败：HTTP ${res.status} ${res.statusText}`)
    }
    return res.arrayBuffer()
  })
  .then(buf => {
    const wb = XLSX.read(buf, { type:"array" })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    users = XLSX.utils.sheet_to_json(sheet, { defval: "" })

    // 诊断：看看读到多少条
    if(!Array.isArray(users) || users.length === 0){
      throw new Error("users.xlsx 解析成功，但没有读到任何账号行。请检查第一行表头是否为 username/password，且下面有数据。")
    }
    // 诊断：检查表头字段
    const sample = users[0]
    if(!("username" in sample) || !("password" in sample)){
      throw new Error(`users.xlsx 表头不匹配。需要列名 username/password，但实际读到的列是：${Object.keys(sample).join(", ")}`)
    }

    btnEl.disabled = false
    btnEl.innerText = "登录"
    msgEl.innerText = `账号加载完成：共 ${users.length} 个账号`
  })
  .catch(err => {
    msgEl.innerText = "账号加载失败：" + err.message
    btnEl.disabled = true
    btnEl.innerText = "无法登录"
  })

function login(){
  const u = document.getElementById("user").value.trim()
  const p = document.getElementById("pass").value

  if(!u || !p){
    msgEl.innerText = "请输入用户名和密码"
    return
  }

  const ok = users.find(x => String(x.username).trim()===u && String(x.password)===p)

  if(ok){
    localStorage.setItem("login","1")
    if(localStorage.getItem("current")===null) localStorage.setItem("current","0")
    if(localStorage.getItem("finished")===null) localStorage.setItem("finished","0")
    location = "quiz.html"
  }else{
    msgEl.innerText = "账号或密码错误（确认 users.xlsx 中确实存在该账号密码）"
  }
}
