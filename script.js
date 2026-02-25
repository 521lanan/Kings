if(localStorage.getItem("login")!=="1"){
    location="index.html"
}

let questions=[]
let current=Number(localStorage.getItem("current")||0)
let finished=Number(localStorage.getItem("finished")||0)

fetch("questions.xlsx")
.then(res=>res.arrayBuffer())
.then(data=>{
    const wb=XLSX.read(data,{type:"array"})
    const sheet=wb.Sheets[wb.SheetNames[0]]
    questions=XLSX.utils.sheet_to_json(sheet)
    show()
})

function updateBar(){
    const percent=(finished/questions.length)*100
    document.getElementById("bar").style.width=percent+"%"
}

function show(){

    if(current>=questions.length){
        location="finish.html"
        return
    }

    const q=questions[current]

    document.getElementById("quiz").innerHTML=`
        <h3>${q.question}</h3>

        <button class="option" onclick="check('A')">A ${q.A}</button>
        <button class="option" onclick="check('B')">B ${q.B}</button>
        <button class="option" onclick="check('C')">C ${q.C}</button>
        <button class="option" onclick="check('D')">D ${q.D}</button>

        <p class="result" id="result"></p>
        <p id="explain"></p>
    `

    updateBar()
}

function check(choice){
    const q=questions[current]

    const ok=choice===q.answer

    document.getElementById("result").innerText=
        ok?"✅ 正确":"❌ 错误"

    document.getElementById("explain").innerText=
        "解析："+q.explain
}

function next(){
    current++
    finished++

    localStorage.setItem("current",current)
    localStorage.setItem("finished",finished)

    show()
}