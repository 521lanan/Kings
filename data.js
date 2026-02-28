let USERS = [];

async function loadUsers() {

  // 强制重新加载
  USERS = [];

  if (typeof XLSX === "undefined") {
    throw new Error("XLSX 未加载，请检查 index.html 是否引入 xlsx.full.min.js");
  }

  const response = await fetch("./users.xlsx?v=" + Date.now(), {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("无法访问 users.xlsx，HTTP状态：" + response.status);
  }

  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  USERS = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (USERS.length === 0) {
    throw new Error("users.xlsx 读取成功但没有数据");
  }

  return USERS;
}

function checkUserCredentials(username, password) {

  username = String(username).trim();
  password = String(password);

  return USERS.some(user =>
    String(user.username).trim() === username &&
    String(user.password) === password
  );
}
