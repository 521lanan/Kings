let users=[]
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

    msgEl.innerText = ""
    btnEl.disabled = false
  })
  .catch(err => {
    msgEl.innerText = "账号文件读取失败，请检查 users.xlsx 是否在仓库根目录"
  })

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
    // 登录成功时，如果之前有进度就继续，没有就从0开始
    if(localStorage.getItem("current")===null) localStorage.setItem("current","0")
    if(localStorage.getItem("finished")===null) localStorage.setItem("finished","0")
    window.location="quiz.html"
  }else{
    msgEl.innerText="账号密码错误"
  }
}
