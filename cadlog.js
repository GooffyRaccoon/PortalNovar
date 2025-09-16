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

// ===== TROCA DE ABAS =====
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    panes.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ===== CADASTRO =====
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMsg();

    const nome = document.getElementById('regNome').value.trim();
    const dataNascimento = document.getElementById('regNascimento').value || null;
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const telefone = document.getElementById('regTelefone').value.trim();
    const usuario = document.getElementById('regUsuario').value.trim().toLowerCase();
    const senha = document.getElementById('regSenha').value;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: { full_name: nome, dob: dataNascimento, phone: telefone, username: usuario }
        }
      });

      if (error) {
        showMsg("Erro ao cadastrar: " + error.message, "error");
        return;
      }

      showMsg("Conta criada! Verifique seu e-mail se precisar confirmar.", "success");
      registerForm.reset();
      document.querySelector('.tab[data-tab="login-pane"]').click();
    } catch (err) {
      console.error(err);
      showMsg("Erro inesperado ao cadastrar.", "error");
    }
  });
}

// ===== LOGIN =====
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMsg();

    let userOrEmail = document.getElementById('loginUser').value.trim().toLowerCase();
    const pass = document.getElementById('loginPass').value;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userOrEmail,
        password: pass
      });

      if (error) {
        showMsg("Erro ao entrar: " + error.message, "error");
        return;
      }

      showMsg("Login realizado com sucesso!", "success");
      loginForm.reset();
    } catch (err) {
      console.error(err);
      showMsg("Erro inesperado no login.", "error");
    }
  });
}

// ===== ESTADO DE AUTENTICAÇÃO =====
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    privateArea.classList.remove('hidden');
    welcomeUser.textContent = `Bem-vindo, ${session.user.user_metadata?.full_name || session.user.email}!`;
  } else {
    privateArea.classList.add('hidden');
  }
});

// ===== LOGOUT =====
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    showMsg("Você saiu da conta.", "success");
  });
}


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
