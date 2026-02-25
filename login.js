let users = []
const msgEl = document.getElementById("msg")
const btnEl = document.getElementById("loginBtn")

msgEl.innerText = "正在加载账号数据..."
btnEl.disabled = true

fetch("users.xlsx")
  .then(res => {
    if(!res.ok) throw new Error("users.xlsx 加载失败")
    return res.arrayBuffer()
  })
  .then(data => {
    const wb = XLSX.read(data,{type:"array"})
    const sheet = wb.Sheets[wb.SheetNames[0]]
    users = XLSX.utils.sheet_to_json(sheet)

    btnEl.disabled = false
    btnEl.innerText = "登录"
    msgEl.innerText = ""
  })
  .catch(() => {
    msgEl.innerText = "账号文件读取失败：请确认 users.xlsx 在仓库根目录且文件名完全一致"
    btnEl.disabled = true
    btnEl.innerText = "无法登录"
  })

function clearMsg(){
  msgEl.innerText = ""
}

function login(){
  const u = document.getElementById("user").value.trim()
  const p = document.getElementById("pass").value

  if(!u || !p){
    msgEl.innerText = "请输入用户名和密码"
    return
  }

  const ok = users.find(x => String(x.username)===u && String(x.password)===p)

  if(ok){
    localStorage.setItem("login","1")

    // 初始化进度（如无则从0开始；如有则续做）
    if(localStorage.getItem("current")===null) localStorage.setItem("current","0")
    if(localStorage.getItem("finished")===null) localStorage.setItem("finished","0")

    window.location = "quiz.html"
  }else{
    msgEl.innerText = "账号或密码错误"
  }
}