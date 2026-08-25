/* ==========================================================
   FARMNEST CUSTOMER PRODUCTS
   FRONTEND → BACKEND API CONNECTION
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:5000/api/products";

  const searchBox = document.getElementById("productSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const productGrid = document.getElementById("productGrid");

  let allProducts = [];

  /* =====================================================
       FETCH PRODUCTS FROM BACKEND
    ===================================================== */

  async function loadProducts() {
    try {
      productGrid.innerHTML = `
                <p style="text-align:center;">
                    Loading products...
                </p>
            `;

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      allProducts = data.products || [];

      renderProducts(allProducts);
    } catch (error) {
      console.error("Product API Error:", error);

      productGrid.innerHTML = `
                <div style="text-align:center; width:100%;">
                    <h3>Unable to load products</h3>
                    <p>Please make sure FarmNest backend is running.</p>
                </div>
            `;
    }
  }

  /* =====================================================
       CATEGORY CONVERSION
    ===================================================== */

  function normalizeCategory(category) {
    if (!category) {
      return "";
    }

    const value = category.toLowerCase();

    const categoryMap = {
      cereals: "grains",
      grains: "grains",
      pulses: "pulses",
      vegetables: "vegetables",
      spices: "spices",
      fruits: "fruits",
      dairy: "dairy",
      organic: "organic",
    };

    return categoryMap[value] || value;
  }

  /* =====================================================
       IMAGE PATH
    ===================================================== */

  function getProductImage(image) {
    if (!image) {
      return "../images/wheat.jpg";
    }

    return "../images/" + image;
  }

  /* =====================================================
       RENDER PRODUCTS
    ===================================================== */

  function renderProducts(products) {
    productGrid.innerHTML = "";

    if (products.length === 0) {
      productGrid.innerHTML = `
                <div style="text-align:center; width:100%;">
                    <h3>No products found</h3>
                    <p>Try another search or category.</p>
                </div>
            `;

      return;
    }

    products.forEach((product) => {
      const farmerName = product.farmerId?.name || "FarmNest Farmer";

      const category = normalizeCategory(product.category);

      const card = document.createElement("div");

      card.className = "product-card";

      card.dataset.category = category;

      card.dataset.id = product._id;

      card.innerHTML = `

    <div class="wishlist">
        <i class="fa-solid fa-heart"></i>
    </div>

    <img
        src="${getProductImage(product.image)}"
        alt="${product.name}"
        onerror="this.src='../images/wheat.jpg'"
    >

    <h3>
        ${product.name}
    </h3>

    <div class="rating">
        ⭐⭐⭐⭐⭐
    </div>

    <p class="price">
        ₹${product.price} / ${product.unit || "kg"}
    </p>

    <p class="farmer">
        👨‍🌾 Farmer: ${farmerName}
    </p>

    <p>
        📦 Available: ${product.quantity} ${product.unit || "kg"}
    </p>

    <button class="cart-btn">
        <i class="fa-solid fa-cart-plus"></i>
        Add To Cart
    </button>

`;

      productGrid.appendChild(card);
    });

    attachProductEvents();
  }

  /* =====================================================
       SEARCH + CATEGORY FILTER
    ===================================================== */

  function filterProducts() {
    const searchValue = searchBox ? searchBox.value.toLowerCase().trim() : "";

    const categoryValue = categoryFilter
      ? categoryFilter.value.toLowerCase()
      : "all";

    const filteredProducts = allProducts.filter((product) => {
      const productName = product.name.toLowerCase();

      const productCategory = normalizeCategory(product.category);

      const matchesSearch = productName.includes(searchValue);

      const matchesCategory =
        categoryValue === "all" || productCategory === categoryValue;

      return matchesSearch && matchesCategory;
    });

    renderProducts(filteredProducts);
  }

  if (searchBox) {
    searchBox.addEventListener("input", filterProducts);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterProducts);
  }

  /* =====================================================
       CART + WISHLIST
    ===================================================== */

  function attachProductEvents() {
    /* ================= CART ================= */

    document.querySelectorAll(".cart-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest(".product-card");

        const productId = card.dataset.id;

        const product = allProducts.find((item) => item._id === productId);

        if (!product) {
          return;
        }

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        const existingProduct = cart.find(
          (item) => item.productId === product._id,
        );

        if (existingProduct) {
          existingProduct.quantity += 1;
        } else {

            
          cart.push({
            productId: product._id,

            name: product.name,

            price: product.price,

            quantity: 1,

            unit: product.unit,

            weightPerUnit: product.weightPerUnit,

            image: getProductImage(product.image),

            farmerId: product.farmerId?._id || null,
          });
        }

        localStorage.setItem("cart", JSON.stringify(cart));

        alert(product.name + " added to Cart 🛒");
      });
    });

    /* ================= WISHLIST ================= */

    document.querySelectorAll(".wishlist").forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest(".product-card");

        const productId = card.dataset.id;

        const product = allProducts.find((item) => item._id === productId);

        if (!product) {
          return;
        }

        let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

        const alreadyExists = wishlist.some(
          (item) => item.productId === product._id,
        );

        if (alreadyExists) {
          alert("Product already in Wishlist ❤️");

          return;
        }

        wishlist.push({
          productId: product._id,

          name: product.name,

          price: product.price,

          image: getProductImage(product.image),

          farmerId: product.farmerId?._id || null,
        });

        localStorage.setItem("wishlist", JSON.stringify(wishlist));

        button.style.color = "red";

        alert(product.name + " added to Wishlist ❤️");
      });
    });
  }

  /* =====================================================
       START
    ===================================================== */

  loadProducts();
});
