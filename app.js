const STORAGE_KEY = "beraskita_data_v1";
const SESSION_KEY = "beraskita_session_v1";

const PRODUCT_IMAGES = {
  P001: "assets/products/beras-premium.webp",
  P002: "assets/products/beras-ramos.webp",
  P003: "assets/products/beras-pandan-wangi.webp",
  P004: "assets/products/beras-ir64.webp",
  P005: "assets/products/beras-pulen-super.webp",
};

const seedData = {
  products: [
    {
      id: "P001",
      name: "Beras Premium",
      price: 15000,
      stock: 120,
      description: "Butiran putih bersih, pulen, dan cocok untuk kebutuhan keluarga.",
    },
    {
      id: "P002",
      name: "Beras Ramos",
      price: 13500,
      stock: 95,
      description: "Beras pilihan dengan tekstur lembut dan aroma nasi yang khas.",
    },
    {
      id: "P003",
      name: "Beras Pandan Wangi",
      price: 17500,
      stock: 60,
      description: "Aroma pandan alami dengan tekstur pulen untuk sajian istimewa.",
    },
    {
      id: "P004",
      name: "Beras IR64",
      price: 12500,
      stock: 150,
      description: "Pilihan ekonomis berkualitas untuk konsumsi sehari-hari.",
    },
    {
      id: "P005",
      name: "Beras Pulen Super",
      price: 16500,
      stock: 75,
      description: "Tekstur sangat pulen, lembut, dan tetap nikmat setelah dingin.",
    },
  ],
  users: [
    {
      id: "U001",
      name: "Admin BerasKita",
      email: "admin@beraskita.id",
      password: "admin123",
      phone: "081234567890",
      address: "Gudang Utama BerasKita",
      role: "admin",
      createdAt: "2026-01-01T08:00:00.000Z",
    },
    {
      id: "U002",
      name: "Pelanggan Demo",
      email: "demo@beraskita.id",
      password: "demo123",
      phone: "081298765432",
      address: "Jakarta, Indonesia",
      role: "buyer",
      createdAt: "2026-05-10T08:00:00.000Z",
    },
  ],
  transactions: [],
  cart: [],
};

const app = document.querySelector("#app");
const nav = document.querySelector("#main-nav");
const menuButton = document.querySelector("#menu-button");

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return structuredClone(seedData);
  }
  return JSON.parse(saved);
}

let data = loadData();
let session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function setSession(user) {
  session = user ? { id: user.id, role: user.role } : null;
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
  renderNav();
}

function currentUser() {
  return data.users.find((user) => user.id === session?.id) || null;
}

function rupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function notify(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(notify.timeout);
  notify.timeout = setTimeout(() => toast.classList.remove("show"), 2600);
}

function navigate(path) {
  window.location.hash = path;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function route() {
  return window.location.hash.slice(1) || "/";
}

function renderNav() {
  const user = currentUser();
  const cartCount = data.cart.reduce((sum, item) => sum + item.quantity, 0);
  const links = user?.role === "admin"
    ? [
        ["/admin", "Dashboard Admin"],
        ["/catalog", "Katalog"],
        ["logout", "Keluar"],
      ]
    : user
      ? [
          ["/", "Beranda"],
          ["/catalog", "Katalog"],
          ["/history", "Riwayat"],
          ["/checkout", `Keranjang (${cartCount})`],
          ["logout", "Keluar"],
        ]
      : [
          ["/", "Beranda"],
          ["/catalog", "Katalog"],
          ["/login", "Masuk"],
          ["/register", "Daftar"],
        ];

  nav.innerHTML = links
    .map(([href, label]) =>
      href === "logout"
        ? `<button class="button button-small button-outline" data-action="logout">${label}</button>`
        : `<a class="nav-link ${route() === href ? "active" : ""}" href="#${href}">${label}</a>`,
    )
    .join("");
}

function productCards(products = data.products) {
  return products
    .map(
      (product) => `
      <article class="product-card">
        <div class="product-visual">
          <img
            src="${escapeHtml(product.image || PRODUCT_IMAGES[product.id] || PRODUCT_IMAGES.P001)}"
            alt="Foto ${escapeHtml(product.name)}"
            loading="lazy"
          />
          <span class="stock-badge ${product.stock < 20 ? "low" : ""}">
            Stok ${product.stock} kg
          </span>
        </div>
        <div class="product-body">
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.description)}</p>
          <div class="product-bottom">
            <span class="price">${rupiah(product.price)} <small>/ kg</small></span>
            <button
              class="button button-primary button-small"
              data-action="add-cart"
              data-id="${product.id}"
              ${product.stock <= 0 ? "disabled" : ""}
            >
              + Keranjang
            </button>
          </div>
        </div>
      </article>`,
    )
    .join("");
}

function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Beras pilihan untuk keluarga Indonesia</p>
        <h1>Kualitas terbaik, langsung ke meja makan.</h1>
        <p>
          Pilih beras berkualitas, pesan dengan mudah, dan dapatkan invoice
          otomatis dalam satu sistem sederhana.
        </p>
        <div class="button-row">
          <a class="button button-light" href="#/catalog">Lihat Katalog</a>
          ${currentUser() ? "" : '<a class="button button-outline" href="#/register" style="color:#fff;border-color:#fff">Daftar Sekarang</a>'}
        </div>
      </div>
      <div class="hero-art" aria-label="Ilustrasi karung beras">
        <div class="rice-bag"></div>
      </div>
    </section>
    <section class="page usage-section">
      <div class="usage-intro">
        <p class="eyebrow" style="color:var(--green-700)">Cara menggunakan</p>
        <h2>Belanja beras hanya dalam 4 langkah</h2>
        <p>Ikuti alur sederhana berikut untuk menyelesaikan pesanan Anda.</p>
      </div>
      <div class="usage-flow">
        <article class="usage-step">
          <span class="step-number">01</span>
          <div class="step-icon" aria-hidden="true">Akun</div>
          <h3>Daftar atau masuk</h3>
          <p>Buat akun pelanggan atau masuk menggunakan akun yang sudah terdaftar.</p>
          <a href="#/register">Mulai daftar →</a>
        </article>
        <article class="usage-step">
          <span class="step-number">02</span>
          <div class="step-icon" aria-hidden="true">Pilih</div>
          <h3>Pilih produk beras</h3>
          <p>Lihat katalog, bandingkan harga dan stok, lalu masukkan produk ke keranjang.</p>
          <a href="#/catalog">Lihat katalog →</a>
        </article>
        <article class="usage-step">
          <span class="step-number">03</span>
          <div class="step-icon" aria-hidden="true">Bayar</div>
          <h3>Periksa dan checkout</h3>
          <p>Atur jumlah pesanan, periksa alamat, lalu konfirmasi untuk membuat transaksi.</p>
          <a href="#/checkout">Buka keranjang →</a>
        </article>
        <article class="usage-step">
          <span class="step-number">04</span>
          <div class="step-icon" aria-hidden="true">Selesai</div>
          <h3>Dapatkan invoice</h3>
          <p>Invoice dibuat otomatis dan pesanan dapat dipantau melalui riwayat pembelian.</p>
          <a href="#/history">Lihat riwayat →</a>
        </article>
      </div>
    </section>
    <section class="page featured-section">
      <div class="section-header">
        <div>
          <p class="eyebrow" style="color:var(--green-700)">Produk unggulan</p>
          <h2>Beras favorit pelanggan</h2>
          <p>Harga transparan dan stok selalu dapat dipantau.</p>
        </div>
        <a class="button button-outline" href="#/catalog">Semua Produk</a>
      </div>
      <div class="product-grid">${productCards(data.products.slice(0, 3))}</div>
    </section>
  `;
}

function renderCatalog() {
  app.innerHTML = `
    <section class="page">
      <div class="section-header">
        <div>
          <p class="eyebrow" style="color:var(--green-700)">Katalog</p>
          <h1>Pilih beras terbaik</h1>
          <p>Semua harga dihitung per kilogram.</p>
        </div>
      </div>
      <div class="product-grid">${productCards()}</div>
    </section>
  `;
}

function renderLogin() {
  if (currentUser()) return navigate(currentUser().role === "admin" ? "/admin" : "/catalog");
  app.innerHTML = `
    <section class="auth-layout">
      <div class="auth-side">
        <p class="eyebrow">Selamat datang kembali</p>
        <h1>Kelola pembelian beras lebih mudah.</h1>
        <p>Masuk untuk berbelanja, melihat invoice, dan memantau riwayat transaksi.</p>
      </div>
      <div class="auth-main">
        <form id="login-form" class="auth-card">
          <h2>Masuk ke akun</h2>
          <p>Gunakan email dan kata sandi Anda.</p>
          <div class="demo-box">
            Admin: admin@beraskita.id / admin123<br />
            Pembeli: demo@beraskita.id / demo123
          </div>
          <div class="form-grid">
            <div class="field">
              <label for="email">Email</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div class="field">
              <label for="password">Kata sandi</label>
              <input id="password" name="password" type="password" required />
            </div>
            <button class="button button-primary" type="submit">Masuk</button>
          </div>
          <p class="helper">Belum punya akun? <a href="#/register">Daftar di sini</a></p>
        </form>
      </div>
    </section>
  `;
}

function renderRegister() {
  if (currentUser()) return navigate("/catalog");
  app.innerHTML = `
    <section class="auth-layout">
      <div class="auth-side">
        <p class="eyebrow">Akun pelanggan</p>
        <h1>Mulai belanja dalam beberapa langkah.</h1>
        <p>Data Anda digunakan untuk invoice dan pengiriman pesanan.</p>
      </div>
      <div class="auth-main">
        <form id="register-form" class="auth-card">
          <h2>Buat akun baru</h2>
          <p>Lengkapi informasi pelanggan berikut.</p>
          <div class="form-grid">
            <div class="field">
              <label for="name">Nama lengkap</label>
              <input id="name" name="name" required />
            </div>
            <div class="field">
              <label for="register-email">Email</label>
              <input id="register-email" name="email" type="email" required />
            </div>
            <div class="field">
              <label for="phone">Nomor telepon</label>
              <input id="phone" name="phone" inputmode="tel" required />
            </div>
            <div class="field">
              <label for="address">Alamat</label>
              <textarea id="address" name="address" rows="3" required></textarea>
            </div>
            <div class="field">
              <label for="register-password">Kata sandi</label>
              <input id="register-password" name="password" type="password" minlength="6" required />
            </div>
            <button class="button button-primary" type="submit">Daftar</button>
          </div>
          <p class="helper">Sudah punya akun? <a href="#/login">Masuk di sini</a></p>
        </form>
      </div>
    </section>
  `;
}

function cartDetails() {
  return data.cart
    .map((item) => {
      const product = data.products.find((candidate) => candidate.id === item.productId);
      return product ? { ...item, product, subtotal: product.price * item.quantity } : null;
    })
    .filter(Boolean);
}

function renderCheckout() {
  const user = currentUser();
  if (!user) return navigate("/login");
  if (user.role === "admin") return navigate("/admin");

  const items = cartDetails();
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shipping = subtotal > 0 ? 15000 : 0;
  const total = subtotal + shipping;

  app.innerHTML = `
    <section class="page">
      <div class="section-header">
        <div>
          <p class="eyebrow" style="color:var(--green-700)">Checkout</p>
          <h1>Keranjang belanja</h1>
        </div>
      </div>
      ${
        items.length
          ? `
          <div class="checkout-layout">
            <div class="panel">
              ${items
                .map(
                  ({ product, quantity, subtotal: itemSubtotal }) => `
                    <div class="cart-item">
                      <div>
                        <h3>${escapeHtml(product.name)}</h3>
                        <span class="helper">${rupiah(product.price)} / kg</span>
                      </div>
                      <div class="quantity">
                        <button data-action="cart-minus" data-id="${product.id}">−</button>
                        <strong>${quantity} kg</strong>
                        <button data-action="cart-plus" data-id="${product.id}">+</button>
                      </div>
                      <strong>${rupiah(itemSubtotal)}</strong>
                    </div>`,
                )
                .join("")}
            </div>
            <aside class="panel">
              <h3>Ringkasan pesanan</h3>
              <div class="summary-row"><span>Subtotal</span><strong>${rupiah(subtotal)}</strong></div>
              <div class="summary-row"><span>Ongkos kirim</span><strong>${rupiah(shipping)}</strong></div>
              <div class="summary-row total"><span>Total</span><span>${rupiah(total)}</span></div>
              <div class="demo-box">
                Dikirim ke:<br />
                <strong>${escapeHtml(user.name)}</strong><br />
                ${escapeHtml(user.address)}
              </div>
              <button class="button button-primary" style="width:100%" data-action="checkout">
                Buat Pesanan
              </button>
            </aside>
          </div>`
          : `
          <div class="panel empty">
            <h3>Keranjang masih kosong</h3>
            <p>Tambahkan produk dari katalog untuk melanjutkan transaksi.</p>
            <a class="button button-primary" href="#/catalog">Lihat Katalog</a>
          </div>`
      }
    </section>
  `;
}

function renderHistory() {
  const user = currentUser();
  if (!user) return navigate("/login");
  const transactions = data.transactions.filter((transaction) => transaction.userId === user.id);

  app.innerHTML = `
    <section class="page">
      <div class="section-header">
        <div>
          <p class="eyebrow" style="color:var(--green-700)">Akun saya</p>
          <h1>Riwayat pembelian</h1>
          <p>Seluruh transaksi dan invoice tersimpan di sini.</p>
        </div>
      </div>
      <div class="panel">
        ${
          transactions.length
            ? `<div class="table-wrap">
                <table>
                  <thead><tr><th>Invoice</th><th>Tanggal</th><th>Total</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    ${transactions
                      .map(
                        (transaction) => `
                          <tr>
                            <td><strong>${transaction.id}</strong></td>
                            <td>${formatDate(transaction.createdAt)}</td>
                            <td>${rupiah(transaction.total)}</td>
                            <td><span class="status ${transaction.status === "Menunggu" ? "pending" : ""}">${transaction.status}</span></td>
                            <td><a class="button button-small button-outline" href="#/invoice/${transaction.id}">Invoice</a></td>
                          </tr>`,
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>`
            : `<div class="empty"><h3>Belum ada transaksi</h3><p>Pesanan yang selesai dibuat akan muncul di sini.</p></div>`
        }
      </div>
    </section>
  `;
}

function renderInvoice(id) {
  const user = currentUser();
  if (!user) return navigate("/login");
  const transaction = data.transactions.find((item) => item.id === id);
  if (!transaction || (user.role !== "admin" && transaction.userId !== user.id)) return renderNotFound();
  const customer = data.users.find((item) => item.id === transaction.userId);

  app.innerHTML = `
    <section class="page">
      <div class="invoice panel">
        <div class="invoice-head">
          <div>
            <div class="brand">
              <span class="brand-mark">BK</span>
              <span><strong>BerasKita</strong><small>Invoice penjualan</small></span>
            </div>
          </div>
          <div class="invoice-meta">
            <h2>INVOICE</h2>
            <p><strong>${transaction.id}</strong><br />${formatDate(transaction.createdAt)}</p>
          </div>
        </div>
        <div class="invoice-customer">
          <strong>Ditagihkan kepada</strong><br />
          ${escapeHtml(customer?.name || "Pelanggan")}<br />
          ${escapeHtml(customer?.phone || "-")}<br />
          ${escapeHtml(customer?.address || "-")}
        </div>
        <div class="table-wrap" style="margin-top:25px">
          <table>
            <thead><tr><th>Produk</th><th>Harga</th><th>Jumlah</th><th>Subtotal</th></tr></thead>
            <tbody>
              ${transaction.items
                .map(
                  (item) => `
                    <tr>
                      <td>${escapeHtml(item.name)}</td>
                      <td>${rupiah(item.price)}</td>
                      <td>${item.quantity} kg</td>
                      <td>${rupiah(item.price * item.quantity)}</td>
                    </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        <div style="margin:25px 0 0 auto;max-width:340px">
          <div class="summary-row"><span>Subtotal</span><strong>${rupiah(transaction.subtotal)}</strong></div>
          <div class="summary-row"><span>Ongkos kirim</span><strong>${rupiah(transaction.shipping)}</strong></div>
          <div class="summary-row total"><span>Total</span><span>${rupiah(transaction.total)}</span></div>
        </div>
        <div class="button-row no-print" style="margin-top:30px">
          <button class="button button-primary" onclick="window.print()">Cetak Invoice</button>
          <a class="button button-outline" href="#${user.role === "admin" ? "/admin/transactions" : "/history"}">Kembali</a>
        </div>
      </div>
    </section>
  `;
}

function adminSidebar(active) {
  return `
    <aside class="sidebar">
      ${[
        ["/admin", "Ringkasan"],
        ["/admin/products", "Data Produk"],
        ["/admin/stock", "Manajemen Stok"],
        ["/admin/customers", "Data Pelanggan"],
        ["/admin/transactions", "Data Transaksi"],
        ["/admin/report", "Laporan Penjualan"],
      ]
        .map(([href, label]) => `<a class="${active === href ? "active" : ""}" href="#${href}">${label}</a>`)
        .join("")}
    </aside>
  `;
}

function adminShell(active, content) {
  const user = currentUser();
  if (!user || user.role !== "admin") return navigate("/login");
  app.innerHTML = `
    <section class="page">
      <div class="section-header">
        <div>
          <p class="eyebrow" style="color:var(--green-700)">Panel admin</p>
          <h1>Halo, ${escapeHtml(user.name)}</h1>
          <p>Kelola penjualan dan persediaan BerasKita.</p>
        </div>
      </div>
      <div class="dashboard-layout">
        ${adminSidebar(active)}
        <div>${content}</div>
      </div>
    </section>
  `;
}

function renderAdmin() {
  const revenue = data.transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const stock = data.products.reduce((sum, product) => sum + product.stock, 0);
  const recent = [...data.transactions].reverse().slice(0, 5);
  adminShell(
    "/admin",
    `
      <div class="stats">
        <div class="stat-card"><span>Total pendapatan</span><strong>${rupiah(revenue)}</strong></div>
        <div class="stat-card"><span>Total transaksi</span><strong>${data.transactions.length}</strong></div>
        <div class="stat-card"><span>Total pelanggan</span><strong>${data.users.filter((user) => user.role === "buyer").length}</strong></div>
        <div class="stat-card"><span>Stok tersedia</span><strong>${stock} kg</strong></div>
      </div>
      <div class="panel">
        <div class="panel-header"><h3>Transaksi terbaru</h3><a href="#/admin/transactions" class="button button-small button-outline">Lihat Semua</a></div>
        ${
          recent.length
            ? transactionTable(recent)
            : '<div class="empty"><h3>Belum ada transaksi</h3><p>Transaksi baru akan tampil di sini.</p></div>'
        }
      </div>
    `,
  );
}

function renderAdminProducts() {
  adminShell(
    "/admin/products",
    `
      <div class="panel">
        <div class="panel-header">
          <div><h3>Data produk</h3><span class="helper">${data.products.length} produk tersedia</span></div>
          <button class="button button-primary button-small" data-action="product-modal">Tambah Produk</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Kode</th><th>Nama</th><th>Harga / kg</th><th>Stok</th><th>Aksi</th></tr></thead>
            <tbody>
              ${data.products
                .map(
                  (product) => `
                  <tr>
                    <td>${product.id}</td>
                    <td><strong>${escapeHtml(product.name)}</strong></td>
                    <td>${rupiah(product.price)}</td>
                    <td>${product.stock} kg</td>
                    <td>
                      <button class="button button-small button-outline" data-action="product-modal" data-id="${product.id}">Edit</button>
                      <button class="button button-small button-danger" data-action="delete-product" data-id="${product.id}">Hapus</button>
                    </td>
                  </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `,
  );
}

function renderAdminStock() {
  adminShell(
    "/admin/stock",
    `
      <div class="panel">
        <div class="panel-header"><div><h3>Manajemen stok</h3><span class="helper">Perbarui persediaan dalam kilogram.</span></div></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Produk</th><th>Status</th><th>Stok saat ini</th><th>Stok baru</th></tr></thead>
            <tbody>
              ${data.products
                .map(
                  (product) => `
                  <tr>
                    <td><strong>${escapeHtml(product.name)}</strong></td>
                    <td><span class="status ${product.stock < 20 ? "pending" : ""}">${product.stock < 20 ? "Stok rendah" : "Tersedia"}</span></td>
                    <td>${product.stock} kg</td>
                    <td>
                      <form class="stock-form" data-id="${product.id}" style="display:flex;gap:8px">
                        <input name="stock" type="number" min="0" value="${product.stock}" style="width:95px;padding:8px;border:1px solid var(--line);border-radius:8px" />
                        <button class="button button-small button-primary">Simpan</button>
                      </form>
                    </td>
                  </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `,
  );
}

function renderAdminCustomers() {
  const customers = data.users.filter((user) => user.role === "buyer");
  adminShell(
    "/admin/customers",
    `
      <div class="panel">
        <div class="panel-header"><div><h3>Data pelanggan</h3><span class="helper">${customers.length} pelanggan terdaftar</span></div></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Nama</th><th>Email</th><th>Telepon</th><th>Alamat</th><th>Terdaftar</th></tr></thead>
            <tbody>
              ${customers
                .map(
                  (user) => `
                    <tr>
                      <td><strong>${escapeHtml(user.name)}</strong></td>
                      <td>${escapeHtml(user.email)}</td>
                      <td>${escapeHtml(user.phone)}</td>
                      <td>${escapeHtml(user.address)}</td>
                      <td>${formatDate(user.createdAt)}</td>
                    </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `,
  );
}

function transactionTable(transactions) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Invoice</th><th>Pelanggan</th><th>Tanggal</th><th>Total</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${transactions
            .map((transaction) => {
              const customer = data.users.find((user) => user.id === transaction.userId);
              return `
                <tr>
                  <td><strong>${transaction.id}</strong></td>
                  <td>${escapeHtml(customer?.name || "-")}</td>
                  <td>${formatDate(transaction.createdAt)}</td>
                  <td>${rupiah(transaction.total)}</td>
                  <td>
                    <select data-action="transaction-status" data-id="${transaction.id}" style="padding:7px;border:1px solid var(--line);border-radius:8px">
                      ${["Menunggu", "Diproses", "Selesai"]
                        .map((status) => `<option ${transaction.status === status ? "selected" : ""}>${status}</option>`)
                        .join("")}
                    </select>
                  </td>
                  <td><a class="button button-small button-outline" href="#/invoice/${transaction.id}">Invoice</a></td>
                </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>`;
}

function renderAdminTransactions() {
  adminShell(
    "/admin/transactions",
    `
      <div class="panel">
        <div class="panel-header"><div><h3>Data transaksi</h3><span class="helper">${data.transactions.length} transaksi tercatat</span></div></div>
        ${
          data.transactions.length
            ? transactionTable([...data.transactions].reverse())
            : '<div class="empty"><h3>Belum ada transaksi</h3><p>Data transaksi pelanggan akan muncul di sini.</p></div>'
        }
      </div>
    `,
  );
}

function renderAdminReport() {
  const totals = Object.fromEntries(data.products.map((product) => [product.name, 0]));
  data.transactions.forEach((transaction) =>
    transaction.items.forEach((item) => {
      totals[item.name] = (totals[item.name] || 0) + item.quantity;
    }),
  );
  const maximum = Math.max(...Object.values(totals), 1);
  const revenue = data.transactions.reduce((sum, item) => sum + item.total, 0);

  adminShell(
    "/admin/report",
    `
      <div class="stats">
        <div class="stat-card"><span>Omzet keseluruhan</span><strong>${rupiah(revenue)}</strong></div>
        <div class="stat-card"><span>Beras terjual</span><strong>${Object.values(totals).reduce((a, b) => a + b, 0)} kg</strong></div>
        <div class="stat-card"><span>Transaksi selesai</span><strong>${data.transactions.filter((item) => item.status === "Selesai").length}</strong></div>
      </div>
      <div class="panel">
        <div class="panel-header">
          <div><h3>Penjualan per produk</h3><span class="helper">Akumulasi kilogram dari seluruh transaksi.</span></div>
          <button class="button button-small button-outline" onclick="window.print()">Cetak Laporan</button>
        </div>
        <div class="bar-chart">
          ${Object.entries(totals)
            .map(
              ([name, quantity]) => `
                <div class="bar-item">
                  <strong>${quantity} kg</strong>
                  <div class="bar" style="height:${Math.max(6, (quantity / maximum) * 155)}px"></div>
                  <small>${escapeHtml(name.replace("Beras ", ""))}</small>
                </div>`,
            )
            .join("")}
        </div>
      </div>
    `,
  );
}

function renderNotFound() {
  app.innerHTML = `
    <section class="page">
      <div class="panel empty">
        <h1>Halaman tidak ditemukan</h1>
        <p>Alamat yang Anda buka tidak tersedia.</p>
        <a class="button button-primary" href="#/">Kembali ke Beranda</a>
      </div>
    </section>`;
}

function showProductModal(id) {
  const product = data.products.find((item) => item.id === id);
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <form id="product-form" class="modal">
      <div class="modal-header">
        <h2>${product ? "Edit Produk" : "Tambah Produk"}</h2>
        <button type="button" class="icon-button" data-action="close-modal">✕</button>
      </div>
      <input type="hidden" name="id" value="${product?.id || ""}" />
      <div class="form-grid">
        <div class="field"><label>Nama produk</label><input name="name" value="${escapeHtml(product?.name || "")}" required /></div>
        <div class="form-grid two">
          <div class="field"><label>Harga per kg</label><input name="price" type="number" min="1" value="${product?.price || ""}" required /></div>
          <div class="field"><label>Stok (kg)</label><input name="stock" type="number" min="0" value="${product?.stock ?? ""}" required /></div>
        </div>
        <div class="field"><label>Deskripsi</label><textarea name="description" rows="3" required>${escapeHtml(product?.description || "")}</textarea></div>
        <button class="button button-primary">Simpan Produk</button>
      </div>
    </form>`;
  document.body.appendChild(backdrop);
}

function addToCart(productId) {
  const user = currentUser();
  if (!user) {
    notify("Silakan masuk sebelum menambahkan produk.");
    return navigate("/login");
  }
  if (user.role === "admin") return notify("Akun admin tidak dapat membuat pesanan.");
  const product = data.products.find((item) => item.id === productId);
  const existing = data.cart.find((item) => item.productId === productId);
  const quantity = existing?.quantity || 0;
  if (!product || quantity >= product.stock) return notify("Jumlah melebihi stok yang tersedia.");
  if (existing) existing.quantity += 1;
  else data.cart.push({ productId, quantity: 1 });
  saveData();
  renderNav();
  notify(`${product.name} ditambahkan ke keranjang.`);
}

function changeCart(productId, delta) {
  const item = data.cart.find((candidate) => candidate.productId === productId);
  const product = data.products.find((candidate) => candidate.id === productId);
  if (!item || !product) return;
  const next = item.quantity + delta;
  if (next > product.stock) return notify("Jumlah melebihi stok.");
  if (next <= 0) data.cart = data.cart.filter((candidate) => candidate.productId !== productId);
  else item.quantity = next;
  saveData();
  renderNav();
  renderCheckout();
}

function createTransaction() {
  const user = currentUser();
  const items = cartDetails();
  if (!user || !items.length) return;
  if (items.some((item) => item.quantity > item.product.stock)) {
    return notify("Ada produk yang stoknya tidak mencukupi.");
  }

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const transaction = {
    id: `INV-${new Date().getFullYear()}-${String(data.transactions.length + 1).padStart(4, "0")}`,
    userId: user.id,
    items: items.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    })),
    subtotal,
    shipping: 15000,
    total: subtotal + 15000,
    status: "Menunggu",
    createdAt: new Date().toISOString(),
  };

  items.forEach(({ product, quantity }) => {
    product.stock -= quantity;
  });
  data.transactions.push(transaction);
  data.cart = [];
  saveData();
  renderNav();
  notify("Pesanan berhasil dibuat.");
  navigate(`/invoice/${transaction.id}`);
}

function submitLogin(form) {
  const values = Object.fromEntries(new FormData(form));
  const user = data.users.find(
    (item) => item.email.toLowerCase() === values.email.toLowerCase() && item.password === values.password,
  );
  if (!user) return notify("Email atau kata sandi tidak sesuai.");
  setSession(user);
  notify(`Selamat datang, ${user.name}.`);
  navigate(user.role === "admin" ? "/admin" : "/catalog");
}

function submitRegister(form) {
  const values = Object.fromEntries(new FormData(form));
  if (data.users.some((user) => user.email.toLowerCase() === values.email.toLowerCase())) {
    return notify("Email sudah terdaftar.");
  }
  const user = {
    id: `U${String(data.users.length + 1).padStart(3, "0")}`,
    ...values,
    role: "buyer",
    createdAt: new Date().toISOString(),
  };
  data.users.push(user);
  saveData();
  setSession(user);
  notify("Pendaftaran berhasil.");
  navigate("/catalog");
}

function submitProduct(form) {
  const values = Object.fromEntries(new FormData(form));
  if (values.id) {
    const product = data.products.find((item) => item.id === values.id);
    Object.assign(product, {
      name: values.name,
      price: Number(values.price),
      stock: Number(values.stock),
      description: values.description,
    });
  } else {
    data.products.push({
      id: `P${String(Math.max(0, ...data.products.map((item) => Number(item.id.slice(1)))) + 1).padStart(3, "0")}`,
      name: values.name,
      price: Number(values.price),
      stock: Number(values.stock),
      description: values.description,
    });
  }
  saveData();
  document.querySelector(".modal-backdrop")?.remove();
  notify("Data produk berhasil disimpan.");
  renderAdminProducts();
}

function renderRoute() {
  renderNav();
  nav.classList.remove("open");
  const path = route();
  const routes = {
    "/": renderHome,
    "/catalog": renderCatalog,
    "/login": renderLogin,
    "/register": renderRegister,
    "/checkout": renderCheckout,
    "/history": renderHistory,
    "/admin": renderAdmin,
    "/admin/products": renderAdminProducts,
    "/admin/stock": renderAdminStock,
    "/admin/customers": renderAdminCustomers,
    "/admin/transactions": renderAdminTransactions,
    "/admin/report": renderAdminReport,
  };

  if (path.startsWith("/invoice/")) renderInvoice(path.split("/").pop());
  else (routes[path] || renderNotFound)();
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;
  const { action, id } = trigger.dataset;

  if (action === "logout") {
    setSession(null);
    data.cart = [];
    saveData();
    notify("Anda telah keluar.");
    navigate("/");
  }
  if (action === "add-cart") addToCart(id);
  if (action === "cart-minus") changeCart(id, -1);
  if (action === "cart-plus") changeCart(id, 1);
  if (action === "checkout") createTransaction();
  if (action === "product-modal") showProductModal(id);
  if (action === "close-modal") document.querySelector(".modal-backdrop")?.remove();
  if (action === "delete-product") {
    if (!confirm("Hapus produk ini?")) return;
    data.products = data.products.filter((item) => item.id !== id);
    data.cart = data.cart.filter((item) => item.productId !== id);
    saveData();
    notify("Produk berhasil dihapus.");
    renderAdminProducts();
  }
});

document.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.target.id === "login-form") submitLogin(event.target);
  if (event.target.id === "register-form") submitRegister(event.target);
  if (event.target.id === "product-form") submitProduct(event.target);
  if (event.target.matches(".stock-form")) {
    const product = data.products.find((item) => item.id === event.target.dataset.id);
    product.stock = Number(new FormData(event.target).get("stock"));
    saveData();
    notify("Stok berhasil diperbarui.");
    renderAdminStock();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.dataset.action !== "transaction-status") return;
  const transaction = data.transactions.find((item) => item.id === event.target.dataset.id);
  transaction.status = event.target.value;
  saveData();
  notify("Status transaksi diperbarui.");
});

menuButton.addEventListener("click", () => nav.classList.toggle("open"));
window.addEventListener("hashchange", renderRoute);
document.querySelector("#year").textContent = new Date().getFullYear();
renderRoute();
