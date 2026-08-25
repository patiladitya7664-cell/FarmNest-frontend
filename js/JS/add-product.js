/* ==========================================================
   FARMNEST - ADD PRODUCT JAVASCRIPT v2.0
   FARMER → BACKEND → MONGODB
   PRODUCT + WEIGHT + IMAGE NAME
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:5000/api/products";

  const form = document.getElementById("addProductForm");
  const productImage = document.getElementById("productImage");

  /* ======================================================
       IMAGE PREVIEW
    ====================================================== */

  if (productImage) {
    productImage.addEventListener("change", function () {
      const file = this.files[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");

        this.value = "";

        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB.");

        this.value = "";

        return;
      }

      const reader = new FileReader();

      reader.onload = function (event) {
        let preview = document.getElementById("imagePreview");

        if (!preview) {
          preview = document.createElement("img");

          preview.id = "imagePreview";

          preview.style.width = "130px";
          preview.style.height = "130px";
          preview.style.objectFit = "cover";
          preview.style.borderRadius = "10px";
          preview.style.marginTop = "15px";
          preview.style.border = "2px solid #2e7d32";
          preview.style.display = "block";
          preview.style.marginLeft = "auto";
          preview.style.marginRight = "auto";

          productImage.parentElement.appendChild(preview);
        }

        preview.src = event.target.result;
      };

      reader.readAsDataURL(file);
    });
  }

  /* ======================================================
       ADD PRODUCT
    ====================================================== */

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      /* ==================================================
               GET FORM VALUES
            ================================================== */

      const productName = document.getElementById("productName")?.value.trim();

      const category = document.getElementById("category")?.value;

      const price = document.getElementById("price")?.value;

      const unit = document.getElementById("unit")?.value;

      const weightPerUnit = document.getElementById("weightPerUnit")?.value;

      const stock = document.getElementById("stock")?.value;

      const warehouse = document.getElementById("warehouse")?.value;

      const productType =
        document.querySelector('input[name="productType"]:checked')?.value ||
        "Organic";

      const description = document.getElementById("description")?.value.trim();

      /* ==================================================
               VALIDATION
            ================================================== */

      if (!productName) {
        alert("Please enter product name.");

        document.getElementById("productName")?.focus();

        return;
      }

      if (!category) {
        alert("Please select product category.");

        document.getElementById("category")?.focus();

        return;
      }

      if (
        price === "" ||
        !Number.isFinite(Number(price)) ||
        Number(price) <= 0
      ) {
        alert("Please enter a valid product price.");

        document.getElementById("price")?.focus();

        return;
      }

      if (!unit) {
        alert("Please select product unit.");

        document.getElementById("unit")?.focus();

        return;
      }

      if (
        weightPerUnit === "" ||
        !Number.isFinite(Number(weightPerUnit)) ||
        Number(weightPerUnit) <= 0
      ) {
        alert("Please enter a valid weight per unit.");

        document.getElementById("weightPerUnit")?.focus();

        return;
      }

      if (
        stock === "" ||
        !Number.isFinite(Number(stock)) ||
        Number(stock) < 0
      ) {
        alert("Please enter a valid stock quantity.");

        document.getElementById("stock")?.focus();

        return;
      }

      if (!description) {
        alert("Please enter product description.");

        document.getElementById("description")?.focus();

        return;
      }

      /* ==================================================
               TOKEN
            ================================================== */

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login as a farmer before adding a product.");

        return;
      }

      /* ==================================================
               IMAGE
            ================================================== */

      const imageFile = productImage?.files?.[0];

      const imageName = imageFile ? imageFile.name : "";

      /* ==================================================
               PRODUCT DATA
            ================================================== */

      const productData = {
        name: productName,

        category: category,

        description: description,

        price: Number(price),

        quantity: Number(stock),

        weightPerUnit: Number(weightPerUnit),

        unit: unit.toLowerCase(),

        image: imageName,
      };

      console.log("Sending Product:", productData);

      /* ==================================================
               DISABLE BUTTON
            ================================================== */

      const submitButton = form.querySelector('button[type="submit"]');

      if (submitButton) {
        submitButton.disabled = true;

        submitButton.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Adding Product...';
      }

      /* ==================================================
               SEND TO BACKEND
            ================================================== */

      try {
        const response = await fetch(API_URL, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: "Bearer " + token,
          },

          body: JSON.stringify(productData),
        });

        const data = await response.json();

        console.log("Backend Response:", data);

        /* ==================================================
                   BACKEND ERROR
                ================================================== */

        if (!response.ok) {
          throw new Error(data.message || "Failed to add product");
        }

        /* ==================================================
                   SUCCESS
                ================================================== */

        console.log("Product Added:", data.product);

        alert(
          "🌱 Product added successfully!\n\n" +
            "Product: " +
            productName +
            "\n\n" +
            "Status: Pending Admin Approval",
        );

        /* ==================================================
                   RESET FORM
                ================================================== */

        form.reset();

        const preview = document.getElementById("imagePreview");

        if (preview) {
          preview.remove();
        }

        /* ==================================================
                   OPTIONAL REDIRECT
                ================================================== */

        // Inventory page par bhejna ho to uncomment karo

        // window.location.href = "inventory.html";
      } catch (error) {
        console.error("Add Product Error:", error);

        alert(error.message || "Failed to add product.");
      } finally {
        /* ==================================================
                   ENABLE BUTTON
                ================================================== */

        if (submitButton) {
          submitButton.disabled = false;

          submitButton.innerHTML = '<i class="fas fa-plus"></i> Add Product';
        }
      }
    });
  }

  /* ======================================================
       RESET BUTTON
    ====================================================== */

  const resetButton = document.querySelector(".cancel-btn");

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      const preview = document.getElementById("imagePreview");

      if (preview) {
        preview.remove();
      }
    });
  }
});
