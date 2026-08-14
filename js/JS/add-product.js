```javascript
/* =========================================
   FARMNEST - ADD PRODUCT JAVASCRIPT
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("addProductForm");
    const productImage = document.getElementById("productImage");

    /* =========================================
       IMAGE PREVIEW
       ========================================= */

    if (productImage) {

        productImage.addEventListener("change", function () {

            const file = this.files[0];

            if (!file) return;

            // Check image type
            if (!file.type.startsWith("image/")) {

                alert("Please select a valid image file.");

                this.value = "";

                return;
            }

            // Check file size - maximum 5MB
            if (file.size > 5 * 1024 * 1024) {

                alert("Image size should be less than 5MB.");

                this.value = "";

                return;
            }

            // Create preview
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


    /* =========================================
       ADD PRODUCT
       ========================================= */

    if (form) {

        form.addEventListener("submit", function (event) {

            event.preventDefault();

            /* Get values */

            const productName =
                document.getElementById("productName").value.trim();

            const category =
                document.getElementById("category").value;

            const price =
                document.getElementById("price").value;

            const unit =
                document.getElementById("unit").value;

            const stock =
                document.getElementById("stock").value;

            const warehouse =
                document.getElementById("warehouse").value;

            const productType =
                document.querySelector(
                    'input[name="productType"]:checked'
                )?.value || "Organic";

            const description =
                document.getElementById("description").value.trim();


            /* =========================================
               VALIDATION
               ========================================= */

            if (productName === "") {

                alert("Please enter product name.");

                document.getElementById("productName").focus();

                return;
            }


            if (category === "") {

                alert("Please select product category.");

                document.getElementById("category").focus();

                return;
            }


            if (price === "" || Number(price) <= 0) {

                alert("Please enter a valid product price.");

                document.getElementById("price").focus();

                return;
            }


            if (unit === "") {

                alert("Please select product unit.");

                document.getElementById("unit").focus();

                return;
            }


            if (stock === "" || Number(stock) < 0) {

                alert("Please enter a valid stock quantity.");

                document.getElementById("stock").focus();

                return;
            }


            if (description === "") {

                alert("Please enter product description.");

                document.getElementById("description").focus();

                return;
            }


            /* =========================================
               PRODUCT OBJECT
               ========================================= */

            const product = {

                id: "P" + Date.now(),

                productName: productName,

                category: category,

                price: Number(price),

                unit: unit,

                stock: Number(stock),

                warehouse: warehouse,

                productType: productType,

                description: description,

                image: productImage?.files[0]?.name || "",

                status:
                    Number(stock) === 0
                        ? "Out of Stock"
                        : Number(stock) <= 20
                            ? "Low Stock"
                            : "In Stock",

                createdAt: new Date().toLocaleDateString("en-IN")

            };


            /* =========================================
               SAVE TO LOCAL STORAGE
               ========================================= */

            let products =
                JSON.parse(localStorage.getItem("farmnestProducts")) || [];

            products.push(product);

            localStorage.setItem(
                "farmnestProducts",
                JSON.stringify(products)
            );


            /* =========================================
               SUCCESS MESSAGE
               ========================================= */

            alert(
                "Product added successfully! 🌱\n\n" +
                "Product: " + productName
            );


            /* =========================================
               RESET FORM
               ========================================= */

            form.reset();

            const preview =
                document.getElementById("imagePreview");

            if (preview) {

                preview.remove();

            }

        });

    }


    /* =========================================
       RESET FORM
       ========================================= */

    const resetButton =
        document.querySelector(".cancel-btn");

    if (resetButton) {

        resetButton.addEventListener("click", function () {

            const preview =
                document.getElementById("imagePreview");

            if (preview) {

                preview.remove();

            }

        });

    }

});
```
