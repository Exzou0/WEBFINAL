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
  const registerBtn = document.getElementById("registerBtn");


  const authState = document.getElementById("authState");
  const authMsg = document.getElementById("authMsg");
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!itemsBody || !itemForm) return;

  let isAuthed = false;


  function showMsg(el, msg, ok = true) {
    if (!el) return;
    el.textContent = msg;
    el.className = "status " + (ok ? "ok" : "err");
    el.style.display = "block";
    setTimeout(() => (el.style.display = "none"), 3000);
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

    if (!res.ok) {
      throw new Error(data?.error || `HTTP ${res.status}`);
    }
    return data;
  }

  function applyAuthUI(state) {
    isAuthed = state;

    authState.textContent = state ? "Logged in" : "Guest";
    authState.className = "pill " + (state ? "pillOk" : "pillWarn");

    loginBtn.style.display = state ? "none" : "inline-block";
    logoutBtn.style.display = state ? "inline-block" : "none";

    submitBtn.disabled = !state;
    nameInput.disabled = !state;
    priceInput.disabled = !state;

    if (!state) resetForm();
  }


  async function checkAuth() {
    try {
      await fetchJson("/auth/me");
      applyAuthUI(true);
    } catch {
      applyAuthUI(false);
    }
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email.includes("@")) {
      showMsg(authMsg, "Invalid email", false);
      return;
    }
    if (password.length < 6) {
      showMsg(authMsg, "Password min 6 chars", false);
      return;
    }

    try {
      loginBtn.disabled = true;

      await fetchJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      showMsg(authMsg, "Login successful");
      applyAuthUI(true);
      loadItems();
    } catch (err) {
      showMsg(authMsg, err.message, false);
    } finally {
      loginBtn.disabled = false;
    }
  });

  logoutBtn.addEventListener("click", async () => {
    await fetchJson("/auth/logout", { method: "POST" });
    applyAuthUI(false);
    loadItems();
  });


  window.registerUser = async function () {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email.includes("@")) {
      showMsg(authMsg, "Invalid email", false);
      return;
    }
    if (password.length < 6) {
      showMsg(authMsg, "Password min 6 chars", false);
      return;
    }

    try {
      await fetchJson("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // auto-login
      await fetchJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      showMsg(authMsg, "Registered & logged in");
      applyAuthUI(true);
      loadItems();
    } catch (err) {
      showMsg(authMsg, err.message, false);
    }
  };


  function renderItems(items) {
    itemsBody.innerHTML = "";

    if (!items.length) {
      itemsBody.innerHTML = `<tr><td colspan="4">No products</td></tr>`;
      return;
    }

    for (const item of items) {
      const id = item._id;
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${id}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${item.price}</td>
        <td>
          ${
            isAuthed
              ? `<button data-edit="${id}">Edit</button>
                 <button class="danger" data-del="${id}">Delete</button>`
              : `<span class="muted">Login required</span>`
          }
        </td>
      `;
      itemsBody.appendChild(tr);
    }
  }

  async function loadItems() {
    try {
      const items = await fetchJson("/api/products");
      renderItems(items);
    } catch (err) {
      showMsg(statusDiv, err.message, false);
    }
  }

  itemForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!isAuthed) return;

    const name = nameInput.value.trim();
    const price = Number(priceInput.value);

    if (!name || price <= 0) {
      showMsg(statusDiv, "Invalid data", false);
      return;
    }

    try {
      if (!itemIdInput.value) {
        await fetchJson("/api/products", {
          method: "POST",
          body: JSON.stringify({
            name,
            price,
            brand: "Generic",
            category: "Electronics",
            stock: 1,
            description: "N/A",
          }),
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

  function resetForm() {
    itemIdInput.value = "";
    nameInput.value = "";
    priceInput.value = "";
    formTitle.textContent = "Create Product";
    submitBtn.textContent = "Create";
    cancelBtn.style.display = "none";
  }

  cancelBtn.addEventListener("click", resetForm);
  refreshBtn.addEventListener("click", loadItems);

  (async function init() {
    await checkAuth();
    await loadItems();
  })();
})();
