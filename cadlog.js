import { supabase } from "./supabaseClient.js";

// DOM
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMsg = document.getElementById("authMsg");
const privateArea = document.getElementById("privateArea");
const welcomeUser = document.getElementById("welcomeUser");
const logoutBtn = document.getElementById("logoutBtn");

function showMsg(text = "", type = "") {
  authMsg.textContent = text;
  authMsg.className = type ? `msg ${type}` : "msg";
}
function toggleTab(tab) {
  if (tab === "login") {
    tabLogin.classList.add("active"); tabRegister.classList.remove("active");
    loginForm.classList.remove("hidden"); registerForm.classList.add("hidden");
  } else {
    tabRegister.classList.add("active"); tabLogin.classList.remove("active");
    registerForm.classList.remove("hidden"); loginForm.classList.add("hidden");
  }
  showMsg();
}

tabLogin.addEventListener("click", () => toggleTab("login"));
tabRegister.addEventListener("click", () => toggleTab("register"));

// Cadastro
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showMsg("Cadastrando...", "");
  const name = document.getElementById("registerName").value.trim();
  const username = document.getElementById("registerUsername").value.trim().toLowerCase();
  const email = document.getElementById("registerEmail").value.trim().toLowerCase();
  const password = document.getElementById("registerPassword").value;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, username }
      }
    });
    if (error) throw error;
    showMsg("Cadastro realizado! Verifique seu e-mail.", "success");
    registerForm.reset();
    toggleTab("login");
  } catch (err) {
    showMsg(err.message || "Erro no cadastro", "error");
    console.error(err);
  }
});

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showMsg("Entrando...", "");
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    showMsg("Login realizado!", "success");
    loginForm.reset();
  } catch (err) {
    showMsg(err.message || "Erro no login", "error");
    console.error(err);
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  showMsg("Você saiu.", "success");
});

// Auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    loginForm.classList.add("hidden");
    registerForm.classList.add("hidden");
    tabLogin.classList.remove("active");
    tabRegister.classList.remove("active");
    privateArea.classList.remove("hidden");
    welcomeUser.textContent = `Bem-vindo, ${session.user.user_metadata?.full_name || session.user.email}`;
  } else {
    privateArea.classList.add("hidden");
  }
});

// Check session on load
(async () => {
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (session) {
    privateArea.classList.remove("hidden");
    welcomeUser.textContent = `Bem-vindo, ${session.user.user_metadata?.full_name || session.user.email}`;
    loginForm.classList.add("hidden");
    registerForm.classList.add("hidden");
  }
})();
