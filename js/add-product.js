/* ==========================================
   FARMNEST - ADD / EDIT PRODUCT
   BACKEND INTEGRATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  console.log("🌱 FarmNest Add Product Loaded");

  const API_URL = "http://localhost:5000/api/products";

  const token = localStorage.getItem("token");

  const form = document.getElementById("addProductForm");

  const productName = document.getElementById("productName");
  const category = document.getElementById("category");
  const price = document.getElementById("price");
  const unit = document.getElementById("unit");
  const weightPerUnit = document.getElementById("weightPerUnit");
  const stock = document.getElementById("stock");
  const description = document.getElementById("description");
  const productImage = document.getElementById("productImage");

  const submitBtn = document.querySelector(".submit-btn");
  const formTitle = document.querySelector(".top-bar h1");
  const formHeader = document.querySelector(".form-header h2");
  const formDescription = document.querySelector(".form-header p");

  // ==========================================
  // AUTH CHECK
  // ==========================================

  if (!token) {
    alert("Please login first.");
    window.location.href = "../login.html";
    return;
  }

  // ==========================================
  // EDIT MODE CHECK
  // ==========================================

  const urlParams = new URLSearchParams(window.location.search);

  const editProductId = urlParams.get("edit");

  let editProduct = null;

  // ==========================================
  // LOAD EDIT PRODUCT
  // ==========================================

  if (editProductId) {
    console.log("✏️ Edit Mode:", editProductId);

    const storedProduct = localStorage.getItem("editProduct");

    if (storedProduct) {
      try {
        editProduct = JSON.parse(storedProduct);

        fillEditForm(editProduct);
      } catch (error) {
        console.error("❌ Edit Product Parse Error:", error);

        loadProductFromBackend(editProductId);
      }
    } else {
      loadProductFromBackend(editProductId);
    }
  }

  // ==========================================
  // FILL EDIT FORM
  // ==========================================

  function fillEditForm(product) {
    if (!product) return;

    productName.value = product.name || "";

    category.value = product.category || "";

    price.value = product.price ?? "";

    unit.value = product.unit || "";

    weightPerUnit.value = product.weightPerUnit ?? "";

    stock.value = product.quantity ?? "";

    description.value = product.description || "";

    // Change UI to EDIT mode

    if (formTitle) {
      formTitle.innerHTML = `
                <i class="fas fa-pen-to-square"></i>
                Edit Product
            `;
    }

    if (formHeader) {
      formHeader.textContent = "Update Product Information";
    }

    if (formDescription) {
      formDescription.textContent =
        "Update your agricultural product details below.";
    }

    if (submitBtn) {
      submitBtn.innerHTML = `
                <i class="fas fa-save"></i>
                Update Product
            `;
    }

    console.log("✏️ Product loaded for editing:", product);
  }

  // ==========================================
  // LOAD PRODUCT FROM BACKEND
  // ==========================================

  async function loadProductFromBackend(productId) {
    try {
      console.log("📦 Loading product:", productId);

      const response = await fetch(`${API_URL}/my`, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load product");
      }

      const product = (data.products || []).find(
        (item) => item._id === productId,
      );

      if (!product) {
        alert("Product not found.");

        window.location.href = "inventory.html";

        return;
      }

      editProduct = product;

      fillEditForm(product);
    } catch (error) {
      console.error("❌ Load Product Error:", error);

      alert(error.message || "Unable to load product.");
    }
  }

  // ==========================================
  // FORM SUBMIT
  // ==========================================

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (editProductId) {
        await updateProduct();
      } else {
        await addProduct();
      }
    });
  }

  // ==========================================
  // ADD PRODUCT
  // ==========================================

  async function addProduct() {
    try {
      const productData = await collectProductData();

      if (!productData) return;

      console.log("📦 Adding Product:", productData);

      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",
        },

        body: JSON.stringify(productData),
      });

      const data = await response.json();

      console.log("📦 Add Product Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product");
      }

      alert(data.message || "Product added successfully!");

      form.reset();

      window.location.href = "inventory.html";
    } catch (error) {
      console.error("❌ Add Product Error:", error);

      alert(error.message || "Unable to add product.");
    }
  }

  // ==========================================
  // UPDATE PRODUCT
  // ==========================================

  async function updateProduct() {
    try {
      if (!editProductId) {
        alert("Product ID not found.");

        return;
      }

      const productData = await collectProductData();

      if (!productData) return;

      console.log("✏️ Updating Product:", editProductId);

      const response = await fetch(`${API_URL}/${editProductId}`, {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",
        },

        body: JSON.stringify(productData),
      });

      const data = await response.json();

      console.log("✏️ Update Product Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to update product");
      }

      alert(data.message || "Product updated successfully!");

      // Remove temporary edit data

      localStorage.removeItem("editProduct");

      // Return to inventory

      window.location.href = "inventory.html";
    } catch (error) {
      console.error("❌ Update Product Error:", error);

      alert(error.message || "Unable to update product.");
    }
  }

  // ==========================================
  // COLLECT FORM DATA
  // ==========================================

  async function collectProductData() {
    const name = productName.value.trim();

    const selectedCategory = category.value;

    const productPrice = Number(price.value);

    const productUnit = unit.value;

    const productWeight = Number(weightPerUnit.value);

    const productQuantity = Number(stock.value);

    const productDescription = description.value.trim();

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!name) {
      alert("Please enter product name.");

      productName.focus();

      return null;
    }

    if (!selectedCategory) {
      alert("Please select category.");

      category.focus();

      return null;
    }

    if (Number.isNaN(productPrice) || productPrice < 0) {
      alert("Please enter a valid price.");

      price.focus();

      return null;
    }

    if (!productUnit) {
      alert("Please select unit.");

      unit.focus();

      return null;
    }

    if (Number.isNaN(productWeight) || productWeight <= 0) {
      alert("Weight per unit must be greater than 0.");

      weightPerUnit.focus();

      return null;
    }

    if (Number.isNaN(productQuantity) || productQuantity < 0) {
      alert("Stock quantity cannot be negative.");

      stock.focus();

      return null;
    }

    if (!productDescription) {
      alert("Please enter product description.");

      description.focus();

      return null;
    }

    // ==========================================
    // IMAGE
    // ==========================================

    let image = "";

    if (productImage && productImage.files.length > 0) {
      const file = productImage.files[0];

      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed.");

        return null;
      }

      /*
              Backend Product model currently
              stores image as a String.

              We therefore send the image
              filename for now.
            */

      image = file.name;
    }

    // ==========================================
    // BACKEND PRODUCT OBJECT
    // ==========================================

    return {
      name: name,

      category: selectedCategory,

      description: productDescription,

      price: productPrice,

      quantity: productQuantity,

      weightPerUnit: productWeight,

      unit: productUnit,

      image: image,
    };
  }

  // ==========================================
  // RESET EDIT MODE
  // ==========================================

  const resetBtn = document.querySelector(".cancel-btn");

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (editProductId) {
        setTimeout(() => {
          fillEditForm(editProduct);
        }, 0);
      }
    });
  }

  console.log("✅ Add/Edit Product JS Ready");
});
