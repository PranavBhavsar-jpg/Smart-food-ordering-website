// --- CONFIG ---
function getApiBase() {
  return "https://smart-food-ordering-website.onrender.com";
}
const API_BASE = getApiBase();

function getAuthToken() {
  return localStorage.getItem("tcet_token") || null;
}

// --- STATE ---
let cart = JSON.parse(localStorage.getItem("tcet_cart")) || [];
let menuItems = [];
let categories = ["All"];
let activeCategory = "All";

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  fetchCategories();
  fetchMenu();
  updateCartUI();
  checkLoginStatus();
});

// --- API CALLS ---
async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/menu/categories`);
    const data = await res.json();

    console.log("API Response:", data); // ✅ ADD THIS

    categories = ["All", ...(data.categories || [])];
    renderCategories();
  } catch (err) {
    console.error("Category error:", err);
  }
}

async function fetchMenu() {
  try {
    const res = await fetch(`${API_BASE}/api/menu`);
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Invalid server response");
    }
    menuItems = (data.items || []).map(i => ({
      ...i,
      id: i._id || i.id
    }));

    renderMenu();
  } catch (err) {
    console.error("Failed to fetch menu:", err);
    // Use fallback menu if API fails
    menuItems = [
      { id: '1', name: "Vada Pav", price: 15, category: "Snacks", image: "images/vada-pav.jpg", desc: "Classic Mumbai burger with spicy chutney" },
      { id: '2', name: "Samosa Pav", price: 18, category: "Snacks", image: "images/samosa.jpg", desc: "Crispy samosa served inside a pav" },
      { id: '3', name: "Masala Chai", price: 10, category: "Beverages", image: "images/masala-chai.jpg", desc: "Hot refreshing tea with spices" },
      { id: '4', name: "Cold Coffee", price: 35, category: "Beverages", image: "images/cold-coffee.jpg", desc: "Chilled coffee with chocolate topping" },
      { id: '5', name: "Veg Schezwan Frankie", price: 50, category: "Snacks", image: "images/frankie.jpg", desc: "Spicy schezwan vegetable roll" },
      { id: '6', name: "Cheese Frankie", price: 60, category: "Snacks", image: "images/frankie.jpg", desc: "Loaded with cheese and veggies" },
      { id: '7', name: "Veg Hakka Noodles", price: 80, category: "Chinese", image: "images/hakka-noodles.jpg", desc: "Stir-fried noodles with veggies" },
      { id: '8', name: "Veg Fried Rice", price: 75, category: "Chinese", image: "images/fried-rice.jpg", desc: "Classic chinese fried rice" },
      { id: '9', name: "Mini Thali", price: 60, category: "Lunch", image: "images/mini-thali.jpg", desc: "3 Roti, Sabzi, Dal, Rice, Pickle" },
      { id: '10', name: "Chole Bhature", price: 70, category: "Lunch", image: "images/chole-bhature.jpg", desc: "Spicy chole with 2 fluffy bhaturas" },
      { id: '11', name: "Idli Sambhar", price: 40, category: "Snacks", image: "images/idli-sambhar.jpg", desc: "2 Idlis with coconut chutney & sambhar" },
      { id: '12', name: "Medu Vada", price: 45, category: "Snacks", image: "images/medu-vada.jpg", desc: "Crispy dal vadas with chutney" }
    ];
    renderMenu();
  }
}

// --- RENDERING ---
function renderCategories() {
  const container = document.getElementById("category-container");
  if (!container) return;

  const fragment = document.createDocumentFragment();
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.onclick = () => setCategory(cat);
    btn.className = `category-chip ${activeCategory === cat ? 'active' : ''}`;
    btn.textContent = cat;
    fragment.appendChild(btn);
  });

  container.innerHTML = "";
  container.appendChild(fragment);
}

function renderMenu() {
  const container = document.getElementById("menu-container");
  if (!container) return;

  const searchInput = document.getElementById("search-input");
  const searchInputMobile = document.getElementById("search-input-mobile");
  const searchVal = (searchInput?.value || searchInputMobile?.value || "").toLowerCase();

  const filtered = menuItems.filter(item => {
    const matchesCat = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchVal) || item.desc.toLowerCase().includes(searchVal);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-20 text-center">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
          <i class="fas fa-search"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-800">No items found</h3>
        <p class="text-gray-500">Try searching for something else or change category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const id = item._id || item.id;
    const qty = getQtyInCart(id);
    // Randomized ETA between 10-25 mins
    const eta = Math.floor(Math.random() * 16) + 10;
    return `
      <div class="glass-card overflow-hidden group">
          <div class="relative h-52 overflow-hidden">
              <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" loading="lazy">
              <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                  <span class="text-xs font-bold text-primary">${item.category}</span>
              </div>
          </div>
          <div class="p-5">
              <div class="flex justify-between items-start mb-1">
                  <h3 class="font-bold text-gray-900 group-hover:text-primary transition">${item.name}</h3>
                  <span class="font-black text-gray-900">₹${item.price}</span>
              </div>
              <p class="text-[10px] text-orange-500 font-bold mb-2"><i class="fas fa-clock mr-1"></i>ETA: ${eta} mins</p>
              <p class="text-xs text-gray-500 line-clamp-2 mb-6 h-8">${item.desc}</p>
              <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                      <button onclick="updateQty('${id}', -1)" class="w-8 h-8 rounded-lg hover:bg-white transition text-gray-400 hover:text-gray-900" aria-label="Decrease quantity"><i class="fas fa-minus text-[10px]"></i></button>
                      <span class="w-8 text-center font-bold text-sm">${qty}</span>
                      <button onclick="updateQty('${id}', 1)" class="w-8 h-8 rounded-lg hover:bg-white transition text-gray-400 hover:text-gray-900" aria-label="Increase quantity"><i class="fas fa-plus text-[10px]"></i></button>
                  </div>
                  <button onclick="addToCart('${id}')" class="btn-gradient flex-1 py-3 text-xs flex items-center justify-center gap-2">
                      <i class="fas fa-plus-circle"></i> Add to Cart
                  </button>
              </div>
          </div>
      </div>
    `;
  }).join("");
}

// --- CART LOGIC ---
function toggleCart() {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("overlay");
  if (!drawer || !overlay) return;
  drawer.classList.toggle("open");
  overlay.classList.toggle("active");
}

function addToCart(id) {
  const item = menuItems.find(i => (i._id || i.id) === id);
  if (!item) return;

  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id: item._id || item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      qty: 1
    });
  }

  saveCart();
  updateCartUI();
  renderMenu(); // Update counts in grid
  showToast(`Added ${item.name} to cart`);

  // Micro-interaction: pop animation
  const btn = event?.currentTarget;
  if (btn) {
    btn.classList.add('add-to-cart-pop');
    setTimeout(() => btn.classList.remove('add-to-cart-pop'), 400);
  }
}

function updateQty(id, delta) {
  const existing = cart.find(i => i.id === id);
  if (!existing) {
    if (delta > 0) addToCart(id);
    return;
  }

  existing.qty += delta;
  if (existing.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  saveCart();
  updateCartUI();
  renderMenu();
}

function getQtyInCart(id) {
  const existing = cart.find(i => i.id === id);
  return existing ? existing.qty : 0;
}

function saveCart() {
  localStorage.setItem("tcet_cart", JSON.stringify(cart));
}

function updateCartUI() {
  const container = document.getElementById("cart-items-container");
  const navCount = document.getElementById("nav-cart-count");
  const floatingCount = document.getElementById("floating-cart-count");
  const drawerItemsCount = document.getElementById("cart-items-count");

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (navCount) navCount.innerText = totalItems;
  if (floatingCount) floatingCount.innerText = totalItems;
  if (drawerItemsCount) drawerItemsCount.innerText = totalItems;

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-center py-12">
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <i class="fas fa-shopping-bag text-4xl text-gray-200"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-800 mb-2">Your cart is empty</h3>
        <p class="text-sm text-gray-500 mb-8 max-w-[200px]">Looks like you haven't added anything to your cart yet.</p>
        <button onclick="toggleCart()" class="btn-gradient px-8 py-3 rounded-2xl">Start Ordering</button>
      </div>
    `;
    updateTotals(0);
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 group">
        <div class="w-20 h-20 rounded-xl overflow-hidden shadow-sm">
            <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
        </div>
        <div class="flex-1">
            <h4 class="font-bold text-gray-900 text-sm mb-1">${item.name}</h4>
            <p class="text-xs font-bold text-primary">₹${item.price}</p>
        </div>
        <div class="flex items-center bg-white rounded-lg p-1 shadow-sm border border-gray-100">
            <button onclick="updateQty('${item.id}', -1)" class="w-7 h-7 rounded-md hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition"><i class="fas fa-minus text-[8px]"></i></button>
            <span class="w-8 text-center font-bold text-xs">${item.qty}</span>
            <button onclick="updateQty('${item.id}', 1)" class="w-7 h-7 rounded-md hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition"><i class="fas fa-plus text-[8px]"></i></button>
        </div>
    </div>
  `).join("");

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  updateTotals(subtotal);
}

function updateTotals(subtotal) {
  const tax = Math.round(subtotal * 0.05);
  const final = subtotal + tax;

  const subtotalEl = document.getElementById("cart-subtotal");
  const taxEl = document.getElementById("cart-tax");
  const finalEl = document.getElementById("cart-final-total");

  if (subtotalEl) subtotalEl.innerText = subtotal;
  if (taxEl) taxEl.innerText = tax;
  if (finalEl) finalEl.innerText = final;
}

// --- CHECKOUT ---
async function checkout() {
  if (cart.length === 0) {
    showToast("Cart is empty!", "error");
    return;
  }

  const token = getAuthToken();
  if (!token) {
    showToast("Please login to order", "error");
    openLoginModal();
    return;
  }

  const methodInput = document.querySelector('input[name="payment-method"]:checked');
  const method = methodInput ? methodInput.value : 'online';

  if (method === 'cod') {
    handleCODCheckout();
  } else {
    handleOnlineCheckout();
  }
}

async function handleCODCheckout() {
  try {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    const items = cart.map(i => ({
      menuItemId: i.id || i._id,
      quantity: i.qty
    }));

    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        items,
        paymentMethod: "cod",
        subtotal,
        tax,
        total
      })
    });

    const data = await res.json();
    if (res.ok) {
      // Use trackingCode from backend
      const trackingId = data.trackingCode;
      const eta = data.eta || "15 mins";
      const quote = data.chefNote || "Great choice! Fresh and delicious food is on the way.";

      showSuccess(trackingId, eta, quote);
      clearCart();
    } else if (res.status === 401 || res.status === 403) {
      showToast("Session expired. Please login again.", "error");
      localStorage.removeItem("tcet_token");
      localStorage.removeItem("tcet_user_name");
      checkLoginStatus();
      openLoginModal();
    } else {
      showToast(data.error || "Order failed", "error");
    }
  } catch (err) {
    showToast("Server error. Try again.", "error");
  }
}

async function handleOnlineCheckout() {
  try {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    const items = cart.map(i => ({
      menuItemId: i.id || i._id,
      quantity: i.qty
    }));

    // 1. Create Razorpay order on backend
    const createRes = await fetch(`${API_BASE}/api/orders/payments/razorpay/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ total })
    });

    const orderData = await createRes.json();
    if (!createRes.ok) throw new Error(orderData.error || "Failed to create payment");

    // 2. Open Razorpay Checkout
    const options = {
      key: orderData.key || "rzp_test_default", // Backend should provide this or we use a fallback
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "TCET Canteen",
      description: "Food Order",
      order_id: orderData.orderId,
      handler: async function (response) {
        // 3. Verify and complete order on backend
        const verifyRes = await fetch(`${API_BASE}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            items,
            paymentMethod: "online",
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            subtotal,
            tax,
            total
          })
        });

        const data = await verifyRes.json();
        if (verifyRes.ok) {
          showSuccess(data.trackingCode, data.eta || "15 mins", data.chefNote);
          clearCart();
        } else if (verifyRes.status === 401 || verifyRes.status === 403) {
          showToast("Session expired. Please login again.", "error");
          localStorage.removeItem("tcet_token");
          localStorage.removeItem("tcet_user_name");
          checkLoginStatus();
          openLoginModal();
        } else {
          showToast(data.error || "Payment verification failed", "error");
        }
      },
      prefill: {
        name: localStorage.getItem("tcet_user_name") || "",
        email: localStorage.getItem("tcet_user_email") || ""
      },
      theme: { color: "#ff7a18" }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    showToast(err.message || "Payment failed to initialize", "error");
  }
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
  renderMenu();
}

// --- AUTH ---
function checkLoginStatus() {
  const name = localStorage.getItem("tcet_user_name");
  const label = document.getElementById("login-button-label");
  if (!label) return;
  if (name) {
    label.innerText = name.split(" ")[0];
  } else {
    label.innerText = "Student Login";
  }
}

async function handleStudentLogin() {
  const nameInput = document.getElementById("login-name");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const errorEl = document.getElementById("login-error");

  const name = nameInput?.value;
  const email = emailInput?.value;
  const password = passwordInput?.value;

  if (!name || !email || !password) {
    if (errorEl) {
      errorEl.innerText = "Please fill all fields";
      errorEl.classList.remove("hidden");
    }
    return;
  }

  try {
    let res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      // try register
      res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
    }

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("tcet_token", data.token);
      localStorage.setItem("tcet_user_name", name);
      localStorage.setItem("tcet_user_email", email);
      closeLoginModal();
      checkLoginStatus();
      showToast("Logged in successfully!");
    } else {
      if (errorEl) {
        errorEl.innerText = data.error || "Login failed";
        errorEl.classList.remove("hidden");
      }
    }
  } catch (err) {
    console.error("Login error:", err); // 👈 VERY IMPORTANT
    if (errorEl) {
      errorEl.innerText = err.message || "Connection error";
      errorEl.classList.remove("hidden");
    }
  }
}

// --- UI HELPERS ---
function setCategory(cat) {
  activeCategory = cat;
  renderCategories();
  renderMenu();
}

function filterMenu() {
  renderMenu();
}

function updatePaymentUI() {
  const methodInput = document.querySelector('input[name="payment-method"]:checked');
  if (!methodInput) return;
  const method = methodInput.value;
  const onlineLabel = document.getElementById("pay-method-online-label");
  const codLabel = document.getElementById("pay-method-cod-label");

  if (!onlineLabel || !codLabel) return;

  if (method === 'online') {
    onlineLabel.classList.add("border-primary", "bg-orange-50/50");
    onlineLabel.classList.remove("border-gray-100", "bg-gray-50/50");
    onlineLabel.querySelector('div')?.classList.add("text-primary");
    onlineLabel.querySelector('div')?.classList.remove("text-gray-400");

    codLabel.classList.add("border-gray-100", "bg-gray-50/50");
    codLabel.classList.remove("border-primary", "bg-orange-50/50");
    codLabel.querySelector('div')?.classList.add("text-gray-400");
    codLabel.querySelector('div')?.classList.remove("text-primary");
  } else {
    codLabel.classList.add("border-primary", "bg-orange-50/50");
    codLabel.classList.remove("border-gray-100", "bg-gray-50/50");
    codLabel.querySelector('div')?.classList.add("text-primary");
    codLabel.querySelector('div')?.classList.remove("text-gray-400");

    onlineLabel.classList.add("border-gray-100", "bg-gray-50/50");
    onlineLabel.classList.remove("border-primary", "bg-orange-50/50");
    onlineLabel.querySelector('div')?.classList.add("text-gray-400");
    onlineLabel.querySelector('div')?.classList.remove("text-primary");
  }
}

function openLoginModal() {
  const modal = document.getElementById("login-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeLoginModal() {
  const modal = document.getElementById("login-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

async function openOrdersModal() {
  const token = getAuthToken();
  if (!token) {
    showToast("Please login to see orders", "error");
    openLoginModal();
    return;
  }

  const modal = document.getElementById("orders-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  const list = document.getElementById("orders-list");
  if (!list) return;
  list.innerHTML = `<div class="py-20 flex justify-center"><i class="fas fa-spinner fa-spin text-3xl text-primary"></i></div>`;

  try {
    const res = await fetch(`${API_BASE}/api/orders/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const orders = await res.json();

    if (orders.length === 0) {
      list.innerHTML = `<div class="py-20 text-center opacity-50"><i class="fas fa-box-open text-5xl mb-4"></i><p>No orders yet</p></div>`;
      return;
    }

    list.innerHTML = orders.reverse().map(order => `
      <div class="bg-gray-50 p-6 rounded-[32px] border border-gray-100 hover:shadow-md transition">
          <div class="flex justify-between items-start mb-4">
              <div>
                  <span class="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Order Token</span>
                  <h4 class="font-black text-gray-900">#${order.trackingCode}</h4>
              </div>
              <span class="px-3 py-1 bg-white rounded-full text-[10px] font-bold shadow-sm ${order.status === 'completed' ? 'text-green-600' : 'text-orange-600'}">
                ${order.status.toUpperCase()}
              </span>
          </div>
          <div class="text-xs text-gray-500 mb-4">
            ${order.items.map(i => `${i.qty}x ${i.name}`).join(", ")}
          </div>
          <div class="flex justify-between items-center pt-4 border-t border-gray-200/50">
              <span class="text-sm font-bold text-gray-900">₹${order.totalAmount}</span>
              <span class="text-[10px] text-gray-400 font-medium">${new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
      </div>
    `).join("");
  } catch (err) {
    list.innerHTML = `<p class="text-center text-red-500 py-10 font-bold">Failed to load orders</p>`;
  }
}

function closeOrdersModal() {
  const modal = document.getElementById("orders-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function showSuccess(token, eta, chefNote) {
  const modal = document.getElementById("success-modal");
  const content = document.getElementById("success-content");

  const tokenEl = document.getElementById("success-token");
  const etaEl = document.getElementById("success-eta");
  const chefEl = document.getElementById("ai-chef-note");

  if (tokenEl) tokenEl.innerText = `#${token}`;
  if (etaEl) etaEl.innerText = eta;
  if (chefEl) chefEl.innerText = chefNote || "Chef is preparing your meal!";

  if (modal && content) {
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal.classList.remove("opacity-0");
      content.classList.remove("scale-90");
    }, 50);
  }
}

function closeSuccess() {
  const modal = document.getElementById("success-modal");
  const content = document.getElementById("success-content");

  if (modal && content) {
    modal.classList.add("opacity-0");
    content.classList.add("scale-90");
    setTimeout(() => {
      modal.classList.add("hidden");
      toggleCart(); // Close cart too
    }, 300);
  }
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const id = "toast-" + Date.now();
  const color = type === "success" ? "bg-gray-900" : "bg-red-500";
  const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";

  const toast = document.createElement("div");
  toast.id = id;
  toast.className = `${color} text-white px-6 py-4 rounded-[20px] shadow-2xl flex items-center gap-3 animate-bounce-in pointer-events-auto transition-all duration-300 transform translate-y-10 opacity-0`;
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span class="text-sm font-bold">${message}</span>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove("translate-y-10", "opacity-0");
  }, 10);

  // Remove
  setTimeout(() => {
    toast.classList.add("opacity-0", "scale-90");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Global expose
window.toggleCart = toggleCart;
window.addToCart = addToCart;
window.updateQty = updateQty;
window.checkout = checkout;
window.setCategory = setCategory;
window.filterMenu = filterMenu;
window.updatePaymentUI = updatePaymentUI;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openOrdersModal = openOrdersModal;
window.closeOrdersModal = closeOrdersModal;
window.handleStudentLogin = handleStudentLogin;
window.closeSuccess = closeSuccess;
