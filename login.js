let users=[]

fetch("users.xlsx")
.then(res=>res.arrayBuffer())
.then(data=>{
    const wb=XLSX.read(data,{type:"array"})
    const sheet=wb.Sheets[wb.SheetNames[0]]
    users=XLSX.utils.sheet_to_json(sheet)
})

function login(){

    const u=document.getElementById("user").value
    const p=document.getElementById("pass").value

    const ok=users.find(x=>x.username===u && x.password===p)

    if(ok){
        localStorage.setItem("login","1")
        window.location="quiz.html"
    }else{
        document.getElementById("msg").innerText="账号密码错误"
    }
}
