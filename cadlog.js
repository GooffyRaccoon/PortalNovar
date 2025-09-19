import { supabase } from "./supabaseClient.js";

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

const supabaseUrl = "https://SUA-URL.supabase.co";
const supabaseKey = "SUA-CHAVE-ANON";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const authArea = document.getElementById("authArea");
const privateArea = document.getElementById("privateArea");
const authMsg = document.getElementById("authMsg");
const msg = document.getElementById("msg");

// ===========================
// MENSAGENS
// ===========================
function showAuthMsg(text, type = "info") {
  authMsg.textContent = text;
  authMsg.className = type;
}

function showMsg(text, type = "info") {
  msg.textContent = text;
  msg.className = type;
}

// ===========================
// CADASTRO
// ===========================
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("regName").value;
  const username = document.getElementById("regUsername").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const dob = document.getElementById("regDob")?.value || null;
  const phone = document.getElementById("regPhone")?.value || null;

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      showAuthMsg("Erro no cadastro: " + error.message, "error");
      return;
    }

    const user = data.user;
    if (!user) {
      showAuthMsg("Erro inesperado: usuário não retornado", "error");
      return;
    }

    const { error: insertError } = await supabase.from("profiles").insert([
      {
        id: user.id,
        full_name: name,
        username: username,
        dob: dob,
        phone: phone,
      },
    ]);

    if (insertError) {
      if (insertError.code === "23505") {
        showAuthMsg("Este nome de usuário já está em uso.", "error");
      } else {
        showAuthMsg("Erro ao salvar perfil: " + insertError.message, "error");
      }
      return;
    }

    showAuthMsg("Cadastro realizado! Agora faça login.", "success");
    e.target.reset();
  } catch (err) {
    console.error(err);
    showAuthMsg("Erro inesperado no cadastro.", "error");
  }
});

// ===========================
// LOGIN
// ===========================
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("logEmail").value;
  const password = document.getElementById("logPassword").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    showAuthMsg("Erro no login: " + error.message, "error");
  } else {
    showAuthMsg("Login realizado com sucesso!", "success");
    carregarPerfil();
  }
});

// ===========================
// LOGOUT
// ===========================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    showMsg("Erro ao sair: " + error.message, "error");
  } else {
    showMsg("Logout realizado!", "success");
    authArea.style.display = "block";
    privateArea.style.display = "none";
  }
});

// ===========================
// CARREGAR PERFIL
// ===========================
async function carregarPerfil() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    authArea.style.display = "block";
    privateArea.style.display = "none";
    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    showMsg("Erro ao carregar perfil: " + error.message, "error");
    return;
  }

  document.getElementById("perfilTableBody").innerHTML = `
    <tr>
      <td>${data.full_name || ""}</td>
      <td>${data.username || ""}</td>
      <td>${data.dob || ""}</td>
      <td>${data.phone || ""}</td>
      <td>
        <button onclick="abrirEdicao('${data.id}','${data.full_name}','${data.username}','${data.dob}','${data.phone}')">Editar</button>
      </td>
    </tr>
  `;

  authArea.style.display = "none";
  privateArea.style.display = "block";
}

// ===========================
// EDITAR PERFIL
// ===========================
window.abrirEdicao = function(id, name, username, dob, phone) {
  document.getElementById("editId").value = id;
  document.getElementById("editName").value = name;
  document.getElementById("editUsername").value = username;
  document.getElementById("editDob").value = dob;
  document.getElementById("editPhone").value = phone;
  document.getElementById("editForm").style.display = "block";
};

document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editId").value;
  const name = document.getElementById("editName").value;
  const username = document.getElementById("editUsername").value;
  const dob = document.getElementById("editDob").value;
  const phone = document.getElementById("editPhone").value;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: name,
      username: username,
      dob: dob,
      phone: phone,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      showMsg("Nome de usuário já está em uso.", "error");
    } else {
      showMsg("Erro ao atualizar perfil: " + error.message, "error");
    }
  } else {
    showMsg("Perfil atualizado com sucesso!", "success");
    e.target.reset();
    document.getElementById("editForm").style.display = "none";
    carregarPerfil();
  }
});

// ===========================
// CHECAR LOGIN AUTOMÁTICO
// ===========================
(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    carregarPerfil();
  }
})();
