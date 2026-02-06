(function () {
  // ---------- CRUD elements ----------
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

  // ---------- Auth elements ----------
  const authState = document.getElementById("authState");
  const authMsg = document.getElementById("authMsg");

  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // If this page has no CRUD UI, skip safely
  if (!itemsBody || !itemForm || !refreshBtn) {
    console.warn("CRUD UI not found on this page, script skipped.");
    return;
  }

  let isAuthed = false;

  // ---------- UI helpers ----------
  function setStatus(msg, type) {
    if (!statusDiv) return;
    statusDiv.textContent = msg;
    statusDiv.className = "status " + (type === "err" ? "err" : "ok");
    statusDiv.style.display = "block";
    setTimeout(() => (statusDiv.style.display = "none"), 3000);
  }

  function setAuthMessage(msg, type) {
    if (!authMsg) return;
    authMsg.textContent = msg;
    authMsg.className = "status " + (type === "err" ? "err" : "ok");
    authMsg.style.display = "block";
    setTimeout(() => (authMsg.style.display = "none"), 3500);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function applyAuthUI(authed) {
    isAuthed = authed;

    // Auth pill + buttons
    if (authState) {
      authState.textContent = authed ? "Logged in" : "Guest";
      authState.className = "pill " + (authed ? "pillOk" : "pillWarn");
    }

    if (logoutBtn) logoutBtn.style.display = authed ? "inline-block" : "none";
    if (loginBtn) loginBtn.style.display = authed ? "none" : "inline-block";

    // CRUD protection in UI
    submitBtn.disabled = !authed;
    nameInput.disabled = !authed;
    priceInput.disabled = !authed;

    // Cancel only relevant in edit mode
    if (!authed) {
      cancelBtn.style.display = "none";
      resetForm();
    }

    // Also hide action buttons in table by re-rendering
    // (renderItems uses isAuthed)
  }

  // ---------- Fetch helper (ALWAYS includes cookies) ----------
  async function fetchJson(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const message =
        (data && data.error) ? data.error :
        `Request failed: ${res.status}`;

      const err = new Error(message);
      err.status = res.status;
      throw err;
    }

    return data;
  }

  // ---------- CRUD render ----------
  function renderItems(items) {
    itemsBody.innerHTML = "";

    if (!items || items.length === 0) {
      itemsBody.innerHTML = `<tr><td colspan="4">No items found</td></tr>`;
      return;
    }

    for (const item of items) {
      const id = item.id ?? item._id;
      const name = item.name ?? "";
      const price = item.price ?? "";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${id}</td>
        <td>${escapeHtml(name)}</td>
        <td>${price}</td>
        <td>
          ${
            isAuthed
              ? `<button class="secondary" data-action="edit" data-id="${id}">Edit</button>
                 <button class="danger" data-action="delete" data-id="${id}">Delete</button>`
              : `<span class="muted">Login to edit</span>`
          }
        </td>
      `;
      itemsBody.appendChild(tr);
    }
  }

  async function loadItems() {
    try {
      const items = await fetchJson("/api/items", { method: "GET" });
      renderItems(items);
    } catch (err) {
      setStatus(err.message, "err");
      itemsBody.innerHTML = `<tr><td colspan="4">Error loading items</td></tr>`;
    }
  }

  function resetForm() {
    itemIdInput.value = "";
    nameInput.value = "";
    priceInput.value = "";
    formTitle.textContent = "Create Item";
    submitBtn.textContent = "Create";
    cancelBtn.style.display = "none";
  }

  function startEdit({ id, name, price }) {
    itemIdInput.value = id;
    nameInput.value = name;
    priceInput.value = price;
    formTitle.textContent = "Update Item";
    submitBtn.textContent = "Update";
    cancelBtn.style.display = "inline-block";
  }

  // ---------- Auth check on page load ----------
  async function checkAuth() {
    try {
      // expected: 200 { user: {...} } OR 401
      await fetchJson("/auth/me", { method: "GET" });
      applyAuthUI(true);
    } catch (err) {
      applyAuthUI(false);
    }
  }

  // ---------- Login / Logout ----------
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = (emailInput?.value || "").trim();
      const password = passwordInput?.value || "";

      if (!email || !password) {
        setAuthMessage("Enter email and password", "err");
        return;
      }

      try {
        loginBtn.disabled = true;

        await fetchJson("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        setAuthMessage("Login successful", "ok");
        applyAuthUI(true);
        await loadItems();
      } catch (err) {
        setAuthMessage(err.message, "err");
        applyAuthUI(false);
      } finally {
        loginBtn.disabled = false;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        logoutBtn.disabled = true;
        await fetchJson("/auth/logout", { method: "POST" });
        setAuthMessage("Logged out", "ok");
      } catch (err) {
        setAuthMessage(err.message, "err");
      } finally {
        logoutBtn.disabled = false;
        applyAuthUI(false);
        await loadItems();
      }
    });
  }

  // ---------- CRUD submit (Create/Update) ----------
  itemForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!isAuthed) {
      setStatus("Unauthorized: please login", "err");
      return;
    }

    const id = itemIdInput.value.trim();
    const name = nameInput.value.trim();
    const price = Number(priceInput.value);

    if (!name || Number.isNaN(price)) {
      setStatus("Enter valid name and price", "err");
      return;
    }

    try {
      submitBtn.disabled = true;

      if (!id) {
        await fetchJson("/api/items", {
          method: "POST",
          body: JSON.stringify({ name, price }),
        });
        setStatus("Created successfully", "ok");
      } else {
        await fetchJson(`/api/items/${id}`, {
          method: "PUT",
          body: JSON.stringify({ name, price }),
        });
        setStatus("Updated successfully", "ok");
      }

      resetForm();
      await loadItems();
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        setStatus("Unauthorized: please login", "err");
        applyAuthUI(false);
      } else {
        setStatus(err.message, "err");
      }
    } finally {
      submitBtn.disabled = false;
    }
  });

  cancelBtn.addEventListener("click", resetForm);
  refreshBtn.addEventListener("click", loadItems);

  // ---------- Table click (Edit/Delete) ----------
  itemsBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (!isAuthed) {
      setStatus("Unauthorized: please login", "err");
      return;
    }

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "edit") {
      const row = btn.closest("tr");
      const name = row.children[1].textContent;
      const price = row.children[2].textContent;
      startEdit({ id, name, price });
    }

    if (action === "delete") {
      const ok = confirm(`Delete item ${id}?`);
      if (!ok) return;

      try {
        btn.disabled = true;
        await fetchJson(`/api/items/${id}`, { method: "DELETE" });
        setStatus("Deleted successfully", "ok");
        await loadItems();
      } catch (err) {
        if (err.status === 401 || err.status === 403) {
          setStatus("Unauthorized: please login", "err");
          applyAuthUI(false);
        } else {
          setStatus(err.message, "err");
        }
      } finally {
        btn.disabled = false;
      }
    }
  });

  // ---------- Init ----------
  (async function init() {
    await checkAuth();
    await loadItems();
    resetForm();
  })();
})();
