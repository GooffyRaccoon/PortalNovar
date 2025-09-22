// --- DOM Elements ---
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

// --- Utility functions ---
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

// --- Tab switching ---
function toggleTab(tab) {
  if (tab === "login") {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  } else {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  }
  showAuthMsg("");
}

tabLogin.addEventListener("click", () => toggleTab("login"));
tabRegister.addEventListener("click", () => toggleTab("register"));

// --- REGISTER ---
registerForm.addEventListener("submit", async (e) => {
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
      options: { data: { full_name: name, username } },
    });
    if (error) throw error;

    // Cria registro no profiles
    if (userData?.user?.id) {
      const { error: profileErr } = await supabase
        .from("profiles")
        .insert([{ id: userData.user.id, full_name: name, username }]);
      if (profileErr) throw profileErr;
    }

    showAuthMsg("Cadastro realizado! Verifique seu e-mail.", "success");
    registerForm.reset();
    toggleTab("login");
  } catch (err) {
    console.error(err);
    showAuthMsg(err?.message || "Erro ao cadastrar", "error");
  }
});

// --- LOGIN ---
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showAuthMsg("Entrando...", "");

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    showAuthMsg("Login realizado!", "success");
    loginForm.reset();
  } catch (err) {
    console.error(err);
    showAuthMsg(err?.message || "Erro no login", "error");
  }
});

// --- LOGOUT ---
async function doLogout() {
  await supabase.auth.signOut();
  showAuthMsg("Você saiu.", "success");
}
logoutBtn.addEventListener("click", doLogout);
logoutBtn2.addEventListener("click", doLogout);

// --- PROFILE / TABLE ---
async function loadMyProfileAndRender(userId, email) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, dob, phone, username")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    usersTableBody.innerHTML = "";

    const row = data || { id: userId, full_name: "(sem perfil)", dob: "", phone: "", username: "" };

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

    const editBtn = tr.querySelector(".edit-btn");
    editBtn.addEventListener("click", () => openEditForm(row, email));
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
    showMsg("Não foi possível carregar seu perfil.", "error");
  }
}

// --- EDIT FORM ---
function openEditForm(profile, email) {
  editFormContainer.classList.remove("hidden");
  document.getElementById("editId").value = profile.id || "";
  document.getElementById("editNome").value = profile.full_name || "";
  document.getElementById("editNascimento").value = profile.dob || "";
  document.getElementById("editEmail").value = email || "";
  document.getElementById("editTelefone").value = profile.phone || "";
  document.getElementById("editUsuario").value = profile.username || "";
}

cancelEdit.addEventListener("click", (e) => {
  e.preventDefault();
  editFormContainer.classList.add("hidden");
});

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showMsg("Salvando...", "");

  const id = document.getElementById("editId").value;
  const full_name = document.getElementById("editNome").value.trim();
  const dob = document.getElementById("editNascimento").value || null;
  const email = document.getElementById("editEmail").value.trim().toLowerCase();
  const phone = document.getElementById("editTelefone").value.trim();
  const username = document.getElementById("editUsuario").value.trim().toLowerCase();

  try {
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ full_name, dob, phone, username })
      .eq("id", id);
    if (updateErr) throw updateErr;

    try {
      const { error: authErr } = await supabase.auth.updateUser({ email });
      if (authErr) console.warn("Não foi possível atualizar email:", authErr.message);
    } catch (e) {
      console.warn("updateUser falhou:", e);
    }

    showMsg("Perfil atualizado com sucesso!", "success");
    editFormContainer.classList.add("hidden");

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await loadMyProfileAndRender(session.user.id, session.user.email);
  } catch (err) {
    console.error(err);
    showMsg(err?.message || "Erro ao salvar perfil", "error");
  }
});

// --- AUTH STATE CHANGE ---
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    authArea.classList.add("hidden");
    privateArea.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    logoutBtn2.classList.remove("hidden");
    await loadMyProfileAndRender(session.user.id, session.user.email);
  } else {
    authArea.classList.remove("hidden");
    privateArea.classList.add("hidden");
    logoutBtn.classList.add("hidden");
    logoutBtn2.classList.add("hidden");
    usersTableBody.innerHTML = "";
    editFormContainer.classList.add("hidden");
  }
});

// --- CHECK SESSION ON LOAD ---
(async () => {
  try {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;

    if (session?.user) {
      authArea.classList.add("hidden");
      privateArea.classList.remove("hidden");
      await loadMyProfileAndRender(session.user.id, session.user.email);
    } else {
      authArea.classList.remove("hidden");
      privateArea.classList.add("hidden");
    }
  } catch (err) {
    console.error("Erro ao checar sessão:", err);
  }
})();
