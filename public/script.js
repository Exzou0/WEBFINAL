(function () {
  const elements = {
    catalogSection: document.getElementById("catalogSection"),
    profileSection: document.getElementById("profileSection"),
    heroSection: document.getElementById("heroSection"),
    adminFormBlock: document.getElementById("adminFormBlock"),
    itemsBody: document.getElementById("itemsBody"),
    authState: document.getElementById("authState"),
    profileLink: document.getElementById("profileLink"),
    loginBtn: document.getElementById("loginBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    adminActions: document.getElementById("adminActions"),
    loginForm: document.getElementById("loginForm"),
    emailInput: document.getElementById("email"),
    passwordInput: document.getElementById("password"),
    roleInput: document.getElementById("role"),
    profileForm: document.getElementById("profileForm"),
    profileEmail: document.getElementById("profileEmail"),
    profilePassword: document.getElementById("profilePassword"),
    itemForm: document.getElementById("itemForm"),
    itemIdInput: document.getElementById("itemId"),
    nameInput: document.getElementById("name"),
    priceInput: document.getElementById("price"),
    brandInput: document.getElementById("brand"),
    categoryInput: document.getElementById("category"),
    stockInput: document.getElementById("stock"),
    imageUrlInput: document.getElementById("imageUrl"),
    descriptionInput: document.getElementById("description"),
    searchInput: document.getElementById("searchInput"),
    categoryFilter: document.getElementById("categoryFilter"),
    sortOrder: document.getElementById("sortOrder")
  };

  let allItems = [];
  let userRole = 'guest';

  const translations = {
    ru: {
      catalog: "Каталог", profile: "Личный кабинет", login: "Войти", logout: "Выйти",
      heroTitle: "Будущее электроники уже здесь", heroSub: "Премиальные гаджеты с гарантией качества и безопасности",
      viewCatalog: "Смотреть каталог", ourProducts: "Наши товары", profileSettings: "Настройки профиля",
      backToStore: "← Вернуться в магазин", emailLabel: "Ваш Email", passwordLabel: "Сменить пароль",
      saveChanges: "Сохранить изменения", searchLabel: "Поиск", categoryLabel: "Категория",
      allCats: "Все категории", sortLabel: "Сортировка", sortNew: "Сначала новые",
      sortCheap: "Сначала дешевые", sortExpensive: "Сначала дорогие", addToCart: "В корзину", inStock: "В наличии", addProduct: "+ Добавить товар",
    editBtn: "Редактировать",
    deleteBtn: "Удалить",
    inStock: "В наличии",
    profileSettings: "Настройки профиля",
    backToStore: "← Вернуться в магазин",
    emailLabel: "Ваш Email",
    emailHelp: "Используется для входа в систему.",
    passwordLabel: "Сменить пароль",
    passwordHelp: "Оставьте пустым, если не хотите менять.",
    saveChanges: "Сохранить изменения",
    securityNotice: "Безопасность: Вы можете редактировать только собственные данные",
    hi: "Привет",
    addItemTitle: "Добавить новый товар",
    editItemTitle: "Редактировать товар",
    itemName: "Название товара",
    itemPrice: "Цена (₸)",
    itemBrand: "Бренд",
    itemCategory: "Категория",
    itemStock: "Кол-во на складе",
    itemImage: "URL изображения",
    itemDesc: "Описание",
    saveItem: "Сохранить товар",
    cancelBtn: "Отмена",
    itemImage: "URL изображения",
    itemImagePlaceholder: "Вставьте ссылку на картинку (https://...)",
    itemNamePlaceholder: "Например: MacBook Pro 14",
    itemPricePlaceholder: "Цена в тенге",
    itemBrandPlaceholder: "Apple, Samsung...",
    itemDescPlaceholder: "Краткое описание характеристик...",
    },
    en: {
      catalog: "Catalog", profile: "Account", login: "Login", logout: "Logout",
      heroTitle: "The Future of Electronics is Here", heroSub: "Premium gadgets with a guarantee of quality and safety",
      viewCatalog: "View Catalog", ourProducts: "Our Products", profileSettings: "Profile Settings",
      backToStore: "← Back to Store", emailLabel: "Your Email", passwordLabel: "Change Password",
      saveChanges: "Save Changes", searchLabel: "Search", categoryLabel: "Category",
      allCats: "All Categories", sortLabel: "Sort By", sortNew: "Newest first",
      sortCheap: "Price: Low to High", sortExpensive: "Price: High to Low", addToCart: "Add to cart", inStock: "In stock", addProduct: "+ Add Product",
    editBtn: "Edit",
    deleteBtn: "Delete",
    inStock: "In stock",
    profileSettings: "Profile Settings",
    backToStore: "← Back to Store",
    emailLabel: "Your Email",
    emailHelp: "Used for system login.",
    passwordLabel: "Change Password",
    passwordHelp: "Leave blank if you don't want to change it.",
    saveChanges: "Save Changes",
    securityNotice: "Security: You can only edit your own data",
    hi: "Hi",
    addItemTitle: "Add New Product",
    editItemTitle: "Edit Product",
    itemName: "Product Name",
    itemPrice: "Price (₸)",
    itemBrand: "Brand",
    itemCategory: "Category",
    itemStock: "Stock Quantity",
    itemImage: "Image URL",
    itemDesc: "Description",
    saveItem: "Save Product",
    cancelBtn: "Cancel",
    itemImage: "Image URL",
    itemImagePlaceholder: "Paste image link (https://...)",
    itemNamePlaceholder: "e.g. MacBook Pro 14",
    itemPricePlaceholder: "Price in Tenge",
    itemBrandPlaceholder: "Apple, Samsung...",
    itemDescPlaceholder: "Short description...",
    },
    kz: {
      heroTitle: "Электроника болашағы осында", heroSub: "Сапа мен қауіпсіздік кепілдігі бар премиум гаджеттер",
      viewCatalog: "Каталогты көру", ourProducts: "Біздің тауарлар", profileSettings: "Профиль параметрлері",
      saveChanges: "Өзгерістерді сақтау", catalog: "Каталог", profile: "Жеке кабинет",
      login: "Кіру", logout: "Шығу", backToStore: "← Дүкенге қайту", emailLabel: "Сіздің Email",
      passwordLabel: "Құпия сөзді өзгерту", searchLabel: "Іздеу", categoryLabel: "Санат",
      allCats: "Барлық санаттар", sortLabel: "Сұрыптау", sortNew: "Алдымен жаңалары",
      sortCheap: "Алдымен арзандары", sortExpensive: "Алдымен қымбаттары", addToCart: "Себетке салу", inStock: "Қоймада бар", addProduct: "+ Тауар қосу",
    editBtn: "Өңдеу",
    deleteBtn: "Өшіру",
    inStock: "Қоймада бар",
profileSettings: "Профиль параметрлері",
    backToStore: "← Дүкенге қайту",
    emailLabel: "Сіздің Email",
    emailHelp: "Жүйеге кіру үшін пайдаланылады.",
    passwordLabel: "Құпия сөзді өзгерту",
    passwordHelp: "Өзгерткіңіз келмесе, бос қалдырыңыз.",
    saveChanges: "Өзгерістерді сақтау",
    securityNotice: "Қауіпсіздік: Сіз тек өз деректеріңізді өңдей аласыз",
    hi: "Сәлем",
    addItemTitle: "Жаңа тауар қосу",
    editItemTitle: "Тауарды өңдеу",
    itemName: "Тауар атауы",
    itemPrice: "Бағасы (₸)",
    itemBrand: "Бренд",
    itemCategory: "Санат",
    itemStock: "Қоймадағы саны",
    itemImage: "Сурет URL-і",
    itemDesc: "Сипаттамасы",
    saveItem: "Тауарды сақтау",
    cancelBtn: "Бас тарту",
    itemImage: "Сурет URL-і",
    itemImagePlaceholder: "Сурет сілтемесін қойыңыз (https://...)",
    itemNamePlaceholder: "Мысалы: MacBook Pro 14",
    itemPricePlaceholder: "Теңгедегі бағасы",
    itemBrandPlaceholder: "Apple, Samsung...",
    itemDescPlaceholder: "Қысқаша сипаттамасы...",

    }
  };


  async function fetchJson(url, options = {}) {
    const res = await fetch(url, { 
      credentials: "include", 
      headers: { "Content-Type": "application/json" }, 
      ...options 
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  }

  window.changeLanguage = (lang) => {
    localStorage.setItem("lang", lang);
    const displayLang = document.getElementById("currentLang");
    if (displayLang) displayLang.textContent = lang.toUpperCase();
    
    document.querySelectorAll("[data-lang]").forEach(el => {
      const key = el.getAttribute("data-lang");
      if (translations[lang][key]) {
        if (el.tagName === "INPUT") el.placeholder = translations[lang][key];
        else el.textContent = translations[lang][key];
      }
    });
    renderItems(allItems);
    const isLogged = (userRole !== 'guest');
    applyAuthUI(isLogged, userRole);
  };

function applyAuthUI(state, role) {
    userRole = role || 'guest';
    

    const lang = localStorage.getItem("lang") || "ru";
    const hiText = translations[lang].hi || "Hi";

    if (elements.authState) {
      elements.authState.textContent = state ? `${hiText}, ${role}` : "Guest";
    }
    
    if (elements.loginBtn) elements.loginBtn.style.display = state ? "none" : "inline-block";
    if (elements.logoutBtn) elements.logoutBtn.style.display = state ? "inline-block" : "none";
    if (elements.profileLink) elements.profileLink.style.display = state ? "inline-block" : "none";
    if (elements.adminActions) elements.adminActions.style.display = (role === 'admin') ? "block" : "none";
  }


function renderItems(items) {
  if (!elements.itemsBody) return;
  elements.itemsBody.innerHTML = "";
  
  const lang = localStorage.getItem("lang") || "ru";
  const btnText = translations[lang].addToCart;
  const stockText = translations[lang].inStock;
  const editLabel = translations[lang].editBtn;
  const deleteLabel = translations[lang].deleteBtn;

  items.forEach(item => {
    const col = document.createElement("div");
    col.className = "col-md-4 col-sm-6";
    
    const imageSrc = item.imageUrl && item.imageUrl.trim() !== "" 
      ? item.imageUrl 
      : "https://via.placeholder.com/300?text=No+Image";

    col.innerHTML = `
      <div class="product product-card d-flex flex-column h-100 shadow-sm p-3 mb-5 rounded">
        <img src="${imageSrc}" 
             class="img-fluid mb-3" 
             alt="${item.name}" 
             style="height: 200px; object-fit: contain;"
             onerror="this.onerror=null;this.src='https://via.placeholder.com/300?text=Error';">
        
        <h5 class="fw-bold">${item.name}</h5>
        <p class="text-muted small">${item.brand || ''} | ${item.category || ''}</p>
        <p class="price-tag mt-auto fs-5 text-primary">${item.price.toLocaleString()} ₸</p>
        <p class="small text-success mb-2">${stockText}: ${item.stock || 0}</p>
        
        <div class="mt-2">
          ${userRole === 'admin' ? 
            `<button class="btn btn-sm btn-outline-warning w-100 mb-2 fw-bold" 
                     onclick="editItem('${item._id}', '${item.name.replace(/'/g, "\\'")}', ${item.price}, '${item.brand}', '${item.category}', ${item.stock}, '${item.imageUrl}', '${item.description ? item.description.replace(/'/g, "\\'") : ""}')">
                ${editLabel}
             </button>
             <button class="btn btn-sm btn-outline-danger w-100 fw-bold" 
                     onclick="deleteItem('${item._id}')">
                ${deleteLabel}
             </button>` : 
            `<button class="btn btn-primary btn-sm w-100 py-2">${btnText}</button>`
          }
        </div>
      </div>`;
    elements.itemsBody.appendChild(col);
  });
}
  function applyFilters() {
    if(!elements.searchInput) return;
    let filtered = [...allItems];
    const query = elements.searchInput.value.toLowerCase();
    if (query) filtered = filtered.filter(i => i.name.toLowerCase().includes(query) || (i.brand && i.brand.toLowerCase().includes(query)));
    const cat = elements.categoryFilter.value;
    if (cat) filtered = filtered.filter(i => i.category === cat);
    const sort = elements.sortOrder.value;
    if (sort === 'cheap') filtered.sort((a,b) => a.price - b.price);
    if (sort === 'expensive') filtered.sort((a,b) => b.price - a.price);
    renderItems(filtered);
  }




  if (elements.loginForm) {
    elements.loginForm.addEventListener("submit", async (e) => {
      e.preventDefault(); 
      try {
        await fetchJson("/auth/login", {
          method: "POST",
          body: JSON.stringify({ 
            email: elements.emailInput.value, 
            password: elements.passwordInput.value 
          })
        });
        window.location.replace("/");
      } catch (err) { 
        alert("Ошибка входа: " + err.message); 
      }
    });
  }

  window.registerUser = async () => {
    if (!elements.emailInput.value || !elements.passwordInput.value) {
      alert("Заполните все поля");
      return;
    }
    try {
      await fetchJson("/auth/register", {
        method: "POST",
        body: JSON.stringify({ 
          email: elements.emailInput.value, 
          password: elements.passwordInput.value,
          role: elements.roleInput ? elements.roleInput.value : 'user'
        })
      });
      alert("Регистрация успешна! Теперь войдите.");
    } catch (err) { alert("Ошибка регистрации: " + err.message); }
  };
  window.showProfile = async () => {
    elements.catalogSection.style.display = "none";
    elements.heroSection.style.display = "none";
    elements.profileSection.style.display = "block";
    try {
      const data = await fetchJson('/api/profile');
      elements.profileEmail.value = data.email;
    } catch (e) { console.error(e); }
  };

  window.hideProfile = () => {
    elements.catalogSection.style.display = "block";
    elements.heroSection.style.display = "flex";
    elements.profileSection.style.display = "none";
  };

  window.deleteItem = async (id) => {
    if (confirm("Удалить товар?")) {
      await fetchJson(`/api/products/${id}`, { method: "DELETE" });
      loadItems();
    }
  };

  window.editItem = (id, n, p, b, c, s, img, d) => {
    elements.adminFormBlock.style.display = "block";
    elements.itemIdInput.value = id;
    elements.nameInput.value = n;
    elements.priceInput.value = p;
    elements.brandInput.value = b;
    elements.categoryInput.value = c;
    elements.stockInput.value = s;
    elements.imageUrlInput.value = img;
    elements.descriptionInput.value = d;
    window.scrollTo({ top: elements.adminFormBlock.offsetTop - 100, behavior: 'smooth' });
  };

  window.showCreateForm = () => {
    elements.adminFormBlock.style.display = "block";
    elements.itemIdInput.value = "";
    elements.itemForm.reset();
  };

  async function loadItems() {
    try {
      allItems = await fetchJson("/api/products");
      applyFilters();
    } catch (e) { console.error(e); }
  }


  elements.itemForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = elements.itemIdInput.value;
    const body = {
      name: elements.nameInput.value, price: Number(elements.priceInput.value),
      brand: elements.brandInput.value, category: elements.categoryInput.value,
      stock: Number(elements.stockInput.value), imageUrl: elements.imageUrlInput.value,
      description: elements.descriptionInput.value
    };
    try {
      await fetchJson(id ? `/api/products/${id}` : "/api/products", { 
        method: id ? "PUT" : "POST", 
        body: JSON.stringify(body) 
      });
      elements.adminFormBlock.style.display = "none";
      loadItems();
    } catch (err) { alert(err.message); }
  });

  elements.searchInput?.addEventListener("input", applyFilters);
  elements.categoryFilter?.addEventListener("change", applyFilters);
  elements.sortOrder?.addEventListener("change", applyFilters);
  
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener("click", async () => {
      await fetchJson("/auth/logout", { method: "POST" });
      window.location.reload();
    });
  }

(async function init() {
    try {
      const data = await fetchJson("/auth/me");
      console.log("Auth success:", data);
      applyAuthUI(true, data.role);
    } catch (e) {
      console.log("Not logged in");
      applyAuthUI(false);
    }
    
    if (elements.itemsBody) {
        await loadItems();
    }
    
    const savedLang = localStorage.getItem("lang") || "ru";
    if (window.changeLanguage) window.changeLanguage(savedLang);
  })();

})();


const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

function setTheme(theme) {
    if (theme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
        if (themeIcon) themeIcon.textContent = "☀️";
    } else {
        document.documentElement.removeAttribute("data-theme");
        if (themeIcon) themeIcon.textContent = "🌙";
    }
}

setTheme(localStorage.getItem("theme") || "dark");

themeToggle?.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const newTheme = isLight ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
});