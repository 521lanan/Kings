let USERS = [];

async function loadUsers() {
  if (USERS.length > 0) return USERS;

  const res = await fetch("users.xlsx", { cache: "no-store" });
  const buf = await res.arrayBuffer();

  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];

  USERS = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  return USERS;
}

function checkUserCredentials(username, password) {
  // 在 USERS 数组中查找匹配的用户名和密码
  const user = USERS.find(u => u.username === username && u.password === password);
  return user !== undefined;
}