(function () {
  const statusDiv = document.getElementById("status");
  const itemsBody = document.getElementById("itemsBody");
  const itemForm = document.getElementById("itemForm");
  const itemIdInput = document.getElementById("itemId");
  const nameInput = document.getElementById("name");
  const priceInput = document.getElementById("price");
  const formTitle = document.getElementById("formTitle");
  const submitBtn = document.getElementById("submitBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const refreshBtn = document.getElementById("refreshBtn");


  const authState = document.getElementById("authState");
  const authMsg = document.getElementById("authMsg");
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  let isAuthed = false;


  function showMsg(el, msg, ok = true) {
    if (!el) return;
    el.textContent = msg;
    el.className = "status " + (ok ? "ok" : "err");
    el.style.display = "block";
    setTimeout(() => { if (el) el.style.display = "none"; }, 3000);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function fetchJson(url, options = {}) {
    const res = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  }



  function applyAuthUI(state) {
    isAuthed = state;

    if (authState) {
      authState.textContent = state ? "Logged in" : "Guest";
      authState.className = "pill " + (state ? "pillOk" : "pillWarn");
    }

    if (loginBtn) loginBtn.style.display = state ? "none" : "inline-block";
    if (logoutBtn) logoutBtn.style.display = state ? "inline-block" : "none";

    if (submitBtn) submitBtn.disabled = !state;
    if (nameInput) nameInput.disabled = !state;
    if (priceInput) priceInput.disabled = !state;

    if (!state) resetForm();
  }

let userRole = 'guest'; 

async function checkAuth() {
  try {
    const data = await fetchJson("/auth/me");
    userRole = data.role; 
    applyAuthUI(true);
  } catch {
    userRole = 'guest';
    applyAuthUI(false);
  }
}

async function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const user = await getUsersCollection().findOne({ _id: new ObjectId(req.session.userId) });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
}

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email.includes("@") || password.length < 6) {
        showMsg(authMsg, "Invalid email or password (min 6 chars)", false);
        return;
      }

      try {
        loginBtn.disabled = true;
        await fetchJson("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        showMsg(authMsg, "Login successful! Redirecting...");
        applyAuthUI(true);
        
        // Редирект на главную после логина
        setTimeout(() => { window.location.href = "/"; }, 1000);
      } catch (err) {
        showMsg(authMsg, err.message, false);
      } finally {
        if (loginBtn) loginBtn.disabled = false;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetchJson("/auth/logout", { method: "POST" });
      applyAuthUI(false);
      if (itemsBody) loadItems();
    });
  }

const roleInput = document.getElementById("role");

window.registerUser = async function () {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const role = roleInput ? roleInput.value : "user"; 

    if (!email.includes("@") || password.length < 6) {
      showMsg(authMsg, "Invalid email or password", false);
      return;
    }

    try {
      await fetchJson("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, role }),
      });

      await fetchJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      showMsg(authMsg, "Registered as " + role + "! Redirecting...");
      applyAuthUI(true);
      setTimeout(() => { window.location.href = "/"; }, 1000);
    } catch (err) {
      showMsg(authMsg, err.message, false);
    }
};



  function renderItems(items) {
    if (!itemsBody) return;
    itemsBody.innerHTML = "";

    if (!items.length) {
      itemsBody.innerHTML = `<tr><td colspan="4">No products</td></tr>`;
      return;
    }


for (const item of items) {
  const id = item._id;
  const tr = document.createElement("tr");
  
  const actionButtons = userRole === 'admin' 
    ? `<button data-edit="${id}">Edit</button> 
       <button class="danger" data-del="${id}">Delete</button>`
    : `<span class="muted">View only</span>`;

  tr.innerHTML = `
    <td>${id}</td>
    <td>${escapeHtml(item.name)}</td>
    <td>${item.price}</td>
    <td>${actionButtons}</td>
  `;
  itemsBody.appendChild(tr);
}
  }

  async function loadItems() {
    if (!itemsBody) return;
    try {
      const items = await fetchJson("/api/products");
      renderItems(items);
    } catch (err) {
      showMsg(statusDiv, err.message, false);
    }
  }

  if (itemForm) {
    itemForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!isAuthed) return;

      const name = nameInput.value.trim();
      const price = Number(priceInput.value);

      try {
        if (!itemIdInput.value) {
          await fetchJson("/api/products", {
            method: "POST",
            body: JSON.stringify({ name, price, brand: "Generic", category: "Electronics", stock: 1, description: "N/A" }),
          });
          showMsg(statusDiv, "Created");
        } else {
          await fetchJson(`/api/products/${itemIdInput.value}`, {
            method: "PUT",
            body: JSON.stringify({ name, price }),
          });
          showMsg(statusDiv, "Updated");
        }
        resetForm();
        loadItems();
      } catch (err) {
        showMsg(statusDiv, err.message, false);
      }
    });
  }

  if (itemsBody) {
    itemsBody.addEventListener("click", async (e) => {
      const editId = e.target.dataset.edit;
      const delId = e.target.dataset.del;

      if (editId) {
        const row = e.target.closest("tr");
        itemIdInput.value = editId;
        nameInput.value = row.children[1].textContent;
        priceInput.value = row.children[2].textContent;
        formTitle.textContent = "Update Product";
        submitBtn.textContent = "Update";
        cancelBtn.style.display = "inline-block";
      }

      if (delId && confirm("Delete product?")) {
        await fetchJson(`/api/products/${delId}`, { method: "DELETE" });
        loadItems();
      }
    });
  }

  function resetForm() {
    if (itemIdInput) itemIdInput.value = "";
    if (nameInput) nameInput.value = "";
    if (priceInput) priceInput.value = "";
    if (formTitle) formTitle.textContent = "Create Product";
    if (submitBtn) submitBtn.textContent = "Create";
    if (cancelBtn) cancelBtn.style.display = "none";
  }

  if (cancelBtn) cancelBtn.addEventListener("click", resetForm);
  if (refreshBtn) refreshBtn.addEventListener("click", loadItems);


  (async function init() {
    await checkAuth();
    if (itemsBody) await loadItems();
  })();
})();