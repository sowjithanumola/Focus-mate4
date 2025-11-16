// ========== PASSWORD HASH ========== //
async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  return Array.from(new Uint8Array(hashBuffer))
              .map(b => b.toString(16).padStart(2, "0"))
              .join("");
}

// ========== ACCOUNT CREATION ========== //
async function createAcc() {
  let u = document.getElementById("newuser").value;
  let p = document.getElementById("newpass").value;

  if (!u || !p) return alert("Enter all details!");

  if (localStorage.getItem("acc_" + u)) {
    alert("Username already taken");
    return;
  }

  let hash = await hashPassword(p);
  localStorage.setItem("acc_" + u, hash);
  alert("Account created!");
}

// ========== LOGIN ========== //
async function login() {
  let u = document.getElementById("user").value;
  let p = document.getElementById("pass").value;
  let msg = document.getElementById("msg");

  if (!u || !p) {
    msg.innerText = "Enter login details!";
    return;
  }

  let stored = localStorage.getItem("acc_" + u);
  if (!stored) {
    msg.innerText = "Account not found!";
    return;
  }

  let hash = await hashPassword(p);

  if (hash === stored) {
    sessionStorage.setItem("user", u);
    window.location.href = "progress.html";
  } else {
    msg.innerText = "Wrong password!";
  }
}

// ========== LOGOUT ========== //
function logout() {
  sessionStorage.removeItem("user");
  window.location.href = "login.html";
}

// ========== PROGRESS PAGE FUNCTIONS ========== //
function generateSuggestion() {
  let mist = document.getElementById("mist").value;
  let remarkBox = document.getElementById("remark");

  if (!mist.trim()) {
    remarkBox.value = "Great work today! Keep reviewing your concepts for steady improvement.";
    return;
  }

  // simple offline AI logic
  let suggestion = "";

  if (mist.includes("confuse") || mist.includes("difficult"))
    suggestion = "Try breaking the concept into smaller steps and revise slowly.";
  else if (mist.includes("slow") || mist.includes("time"))
    suggestion = "Practice timed exercises to improve speed.";
  else if (mist.includes("forget"))
    suggestion = "Use flashcards or short notes to improve memory.";
  else
    suggestion = "Keep practicing regularly and focus on mistakes for improvement.";

  remarkBox.value = suggestion;
}

function saveEntry() {
  let user = sessionStorage.getItem("user");
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  let sub = document.getElementById("sub").value;
  let time = document.getElementById("time").value;
  let mist = document.getElementById("mist").value;
  let remark = document.getElementById("remark").value;

  if (!sub || !time) {
    alert("Enter subject and time!");
    return;
  }

  let entry = {
    date: new Date().toLocaleDateString(),
    sub, time, mist, remark
  };

  let data = JSON.parse(localStorage.getItem("data_" + user) || "[]");
  data.push(entry);

  localStorage.setItem("data_" + user, JSON.stringify(data));

  alert("Entry Saved!");
  loadTable();
  drawGraph();
}

function loadTable() {
  let user = sessionStorage.getItem("user");
  let table = document.getElementById("table");
  let data = JSON.parse(localStorage.getItem("data_" + user) || "[]");

  table.innerHTML = `
    <tr>
      <th>Date</th>
      <th>Subject</th>
      <th>Minutes</th>
      <th>Mistakes</th>
      <th>Remark</th>
    </tr>
  `;

  data.forEach(d => {
    table.innerHTML += `
      <tr>
        <td>${d.date}</td>
        <td>${d.sub}</td>
        <td>${d.time}</td>
        <td>${d.mist}</td>
        <td>${d.remark}</td>
      </tr>
    `;
  });
}

function drawGraph() {
  let user = sessionStorage.getItem("user");
  let data = JSON.parse(localStorage.getItem("data_" + user) || "[]");

  let labels = data.map(d => d.date);
  let values = data.map(d => Number(d.time));

  new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Minutes Studied",
        data: values,
        borderColor: "#4a63e7",
        backgroundColor: "rgba(74,99,231,0.3)",
        fill: true
      }]
    }
  });
}

window.onload = function () {
  if (document.getElementById("table")) {
    loadTable();
    drawGraph();
  }
};
