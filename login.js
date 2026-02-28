const msgEl = document.getElementById("msg");
const btnEl = document.getElementById("loginBtn");

function clearMsg(){ msgEl.innerText = ""; }

// WebCrypto: base64 -> Uint8Array
function b64ToBytes(b64){
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pbkdf2Key(password, saltBytes, iterations){
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveBits","deriveKey"]
  );
  // derive key for AES-GCM
  const aesKey = await crypto.subtle.deriveKey(
    { name:"PBKDF2", salt: saltBytes, iterations, hash:"SHA-256" },
    baseKey,
    { name:"AES-GCM", length:256 },
    false,
    ["decrypt"]
  );
  // derive verify bits (32 bytes)
  const verifyBits = await crypto.subtle.deriveBits(
    { name:"PBKDF2", salt: saltBytes, iterations, hash:"SHA-256" },
    baseKey,
    256
  );
  return { aesKey, verifyBytes: new Uint8Array(verifyBits) };
}

function bytesEqual(a,b){
  if(a.length !== b.length) return false;
  let ok = 1;
  for(let i=0;i<a.length;i++) ok &= (a[i] === b[i]) ? 1 : 0;
  return !!ok;
}

async function login(){
  const username = document.getElementById("username").value;
  const password = document.getElementById("pass").value;
  if(!username || !password){
    msgEl.innerText = "请输入用户名和密码";
    return;
  }
  btnEl.disabled = true;
  msgEl.innerText = "正在验证并加载题库密文...";

  try{
    // 加载用户列表并验证
    const users = await loadUsers();
    const isValidUser = checkUserCredentials(username, password);
    if (!isValidUser) {
      msgEl.innerText = "用户名或密码错误";
      btnEl.disabled = false;
      return;
    }

    const res = await fetch("encrypted_questions.json", { cache:"no-store" });
    if(!res.ok) throw new Error("无法加载 encrypted_questions.json（请确认已上传到仓库根目录）");
    const pack = await res.json();

    const iter = pack.kdf.iter;
    const saltBytes = b64ToBytes(pack.kdf.salt_b64);
    const verifyTarget = b64ToBytes(pack.verify_b64);

    const { aesKey, verifyBytes } = await pbkdf2Key(password, saltBytes, iter);

    if(!bytesEqual(verifyBytes, verifyTarget)){
      msgEl.innerText = "密码错误";
      btnEl.disabled = false;
      return;
    }

    // ✅ 密码正确：把“密码”存在 sessionStorage（关闭浏览器就失效）
    sessionStorage.setItem("quiz_password", password);

    // 初始化进度
    if(localStorage.getItem("current")===null) localStorage.setItem("current","0");
    if(localStorage.getItem("finished")===null) localStorage.setItem("finished","0");

    location = "quiz.html";
  }catch(e){
    msgEl.innerText = "登录失败：" + (e?.message || String(e));
    btnEl.disabled = false;
  }
}