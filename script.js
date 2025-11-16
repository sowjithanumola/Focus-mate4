// SHA-256 hashing function
async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  return Array.from(new Uint8Array(hashBuffer))
              .map(b => b.toString(16).padStart(2, "0"))
              .join("");
}

// Create a new account
async function createAcc() {
  let u = document.getElementById("newuser").value;
  let p = document.getElementById("newpass").value;

  if (!u || !p) {
    alert("Please enter username and password!");
    return;
  }

  if (localStorage.getItem("acc_" + u)) {
    alert("Username already exists!");
    return;
  }

  let hash = await hashPassword(p);
  localStorage.setItem("acc_" + u, hash);

  alert("Account Created Successfully!");
}

// Login function
async function login() {
  let u = document.getElementById("user").value;
  let p = document.getElementById("pass").value;
  let msg = document.getElementById("msg");

  if (!u || !p) {
    msg.innerText = "Please enter login details!";
    return;
  }

  let storedHash = localStorage.getItem("acc_" + u);
  if (!storedHash) {
    msg.innerText = "Account does not exist!";
    return;
  }

  let enteredHash = await hashPassword(p);

  if (enteredHash === storedHash) {
    sessionStorage.setItem("user", u);
    window.location.href = "progress.html"; // redirect
  } else {
    msg.innerText = "Incorrect password!";
  }
}
