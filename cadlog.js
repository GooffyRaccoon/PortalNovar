import { supabase } from "./supabaseClient.js";

// DOM
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMsg = document.getElementById("authMsg");
const authArea = document.getElementById("authArea");
const privateArea = document.getElementById("privateArea");
const usersTableBody = document.querySelector("#usersTable tbody");
const editFormContainer = document.getElementById("editFormContainer");
const editForm = document.getElementById("editForm");
const cancelEdit = document.getElementById("cancelEdit");
const msgBox = document.getElementById("msg");
const logoutBtn = document.getElementById("logoutBtn");
const logoutBtn2 = document.getElementById("logoutBtn2");

// util: mostrar mensagens
function showAuthMsg(text = "", type = "") {
  if (!authMsg) return;
  authMsg.textContent = text;
  authMsg.className = type ? `msg ${type}` : "msg";
}
function showMsg(text = "", type = "") {
  if (!msgBox) return;
  msgBox.textContent = text;
  msgBox.className = type ? `msg ${type}` : "msg";
}

// troca abas
function toggleTab(tab) {
  if (tab === "login") {
    tabLogin?.classList.add("active"); tabRegister?.classList.remove("active");
    loginForm?.classList.remove("hidden"); registerForm?.classList.add("hidden");
  } else {
    tabRegister?.classList.add("active"); tabLogin?.classList.remove("active");
    registerForm?.classList.remove("hidden"); loginForm?.classList.add("hidden");
  }
  showAuthMsg("");
}

tabLogin?.addEventListener("click", () => toggleTab("login"));
tabRegister?.addEventListener("click", () => toggleTab("register"));

// --- REGISTER ---
registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  showAuthMsg("Cadastrando...", "");
  const name = document.getElementById("registerName").value.trim();
  const username = document.getElementById("registerUsername").value.trim().toLowerCase();
  const email = document.getElementById("registerEmail").value.trim().toLowerCase();
  const password = document.getElementById("registerPassword").value;

  try {
    const { data: userData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, username } }
    });
    if (error) throw error;

    // Cria registro no profiles
    if (userData?.user?.id) {
      const { error: profileErr } = await supabase
        .from("profiles")
        .insert([{ id: userData.user.id, full_name: name, username }]);
      if (profileErr) throw profileErr;
    }

    showAuthMsg("Cadastro realizado! Verifique seu e-mail caso seja necessário.", "success");
    registerForm.reset();
    toggleTab("login");
  } catch (err) {
    console.error(err);
    showAuthMsg(err?.message || "Erro ao cadastrar", "error");
  }
});

// --- LOGIN ---
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  showAuthMsg("Entrando...", "");
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    showAuthMsg("Login realizado!", "success");
    loginForm.reset();
    // sessão será tratada pelo listener onAuthStateChange
  } catch (err) {
    console.error(err);
    showAuthMsg(err?.message || "Erro no login", "error");
  }
});

// --- LOGOUT ---
async function doLogout() {
  await supabase.auth.signOut();
  showAuthMsg("Você saiu.", "success");
  // onAuthStateChange esconderá as áreas
}
logoutBtn?.addEventListener("click", doLogout);
logoutBtn2?.addEventListener("click", doLogout);

// --- Funções de perfil / tabela ---
// pega apenas o perfil do usuário logado (por causa das políticas RLS)
async function loadMyProfileAndRender(userId, email) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, dob, phone, username, created_at")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116" /* not found */) throw error;

    // limpa tabela
    usersTableBody.innerHTML = "";

    const row = data ? data : { id: userId, full_name: "(sem perfil)", dob: null, phone: "", username: "" };

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.full_name || ""}</td>
      <td>${row.dob || ""}</td>
      <td>${email || ""}</td>
      <td>${row.phone || ""}</td>
      <td>${row.username || ""}</td>
      <td>
        <button class="btn edit-btn" data-id="${row.id}">Editar</button>
      </td>
    `;
    usersTableBody.appendChild(tr);

    // bind edit button
    const editBtn = tr.querySelector(".edit-btn");
    editBtn?.addEventListener("click", () => openEditForm(row, email));
  } catch (err) {
    console.error("Erro ao carregar profile:", err);
    showMsg("Não foi possível carregar seu perfil.", "error");
  }
}

function openEditForm(profile, email) {
  if (!editFormContainer || !editForm) return;
  editFormContainer.classList.remove("hidden");
  document.getElementById("editId").value = profile.id || "";
  document.getElementById("editNome").value = profile.full_name || "";
  document.getElementById("editNascimento").value = profile.dob || "";
  document.getElementById("editEmail").value = email || "";
  document.getElementById("editTelefone").value = profile.phone || "";
  document.getElementById("editUsuario").value = profile.username || "";
}

// cancelar edição
cancelEdit?.addEventListener("click", (e) => {
  e.preventDefault();
  editFormContainer.classList.add("hidden");
});

// submit editar perfil
editForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  showMsg("Salvando...", "");
  const id = document.getElementById("editId").value;
  const full_name = document.getElementById("editNome").value.trim();
  const dob = document.getElementById("editNascimento").value || null;
  const email = document.getElementById("editEmail").value.trim().toLowerCase();
  const phone = document.getElementById("editTelefone").value.trim();
  const username = document.getElementById("editUsuario").value.trim().toLowerCase();

  try {
    // 1) atualiza a tabela profiles
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ full_name, dob, phone, username })
      .eq("id", id);

    if (updateErr) throw updateErr;

    // 2) tentar atualizar email no auth (pode solicitar confirmação)
    try {
      const { error: authErr } = await supabase.auth.updateUser({ email });
      if (authErr) {
        // nem sempre possível (relogin / confirmação)
        console.warn("Não foi possível atualizar email no auth:", authErr.message);
      }
    } catch (e) {
      console.warn("updateUser falhou:", e);
    }

    showMsg("Perfil atualizado com sucesso!", "success");
    editFormContainer.classList.add("hidden");

    // recarregar perfil atual
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadMyProfileAndRender(session.user.id, session.user.email);
    }
  } catch (err) {
    console.error("Erro ao salvar perfil:", err);
    showMsg(err?.message || "Erro ao salvar perfil", "error");
  }
});

// --- auth state change listener ---
supabase.auth.onAuthStateChange(async (event, session) => {
  // caso de login/ logout
  if (session?.user) {
    // mostrar área privada, esconder auth forms
    authArea?.classList.add("hidden");
    privateArea?.classList.remove("hidden");
    logoutBtn?.classList.remove("hidden");
    logoutBtn2?.classList.remove("hidden");
    // carrega o perfil do usuário logado
    await loadMyProfileAndRender(session.user.id, session.user.email);
  } else {
    // sem sessão: mostrar formulários
    authArea?.classList.remove("hidden");
    privateArea?.classList.add("hidden");
    logoutBtn?.classList.add("hidden");
    logoutBtn2?.classList.add("hidden");
    usersTableBody.innerHTML = "";
    editFormContainer?.classList.add("hidden");
  }
});

// check session on load (persistência)
(async () => {
  try {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    if (session?.user) {
      authArea?.classList.add("hidden");
      privateArea?.classList.remove("hidden");
      await loadMyProfileAndRender(session.user.id, session.user.email);
    } else {
      authArea?.classList.remove("hidden");
      privateArea?.classList.add("hidden");
    }
  } catch (err) {
    console.error("Erro ao checar sessão:", err);
  }
})();
