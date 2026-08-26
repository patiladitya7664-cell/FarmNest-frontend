/* ==========================================================
   FARMNEST - INDEX.JS
   HOME PAGE BACKEND + CUSTOMER ACCOUNT INTEGRATION
========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ======================================================
       API
    ====================================================== */

    const API_URL = "http://localhost:5000/api";


    /* ======================================================
       ELEMENTS
    ====================================================== */

    const productContainer =
        document.querySelector(".product-container");

    const guestAccount =
        document.getElementById("guestAccount");

    const customerAccount =
        document.getElementById("customerAccount");

    const customerName =
        document.getElementById("customerName");

    const logoutBtn =
        document.getElementById("logoutBtn");


    /* ======================================================
       CUSTOMER ACCOUNT
    ====================================================== */

    function loadCustomerAccount() {

        const currentUser =
            localStorage.getItem("farmnestCurrentUser");

        /* ------------------------------
           NOT LOGGED IN
        ------------------------------ */

        if (!currentUser) {

            if (guestAccount) {
                guestAccount.style.display = "flex";
            }

            if (customerAccount) {
                customerAccount.style.display = "none";
            }

            return;
        }


        try {

            const user =
                JSON.parse(currentUser);


            /* ------------------------------
               CUSTOMER
            ------------------------------ */

            if (user.role === "customer") {

                if (guestAccount) {
                    guestAccount.style.display = "none";
                }

                if (customerAccount) {
                    customerAccount.style.display = "flex";
                }

                if (customerName) {
                    customerName.textContent =
                        user.name || "Customer";
                }

                return;
            }


            /* ------------------------------
               FARMER / ADMIN
            ------------------------------ */

            if (guestAccount) {
                guestAccount.style.display = "flex";
            }

            if (customerAccount) {
                customerAccount.style.display = "none";
            }

        } catch (error) {

            console.error(
                "User data error:",
                error
            );

            clearSession();

        }
    }


    /* ======================================================
       CLEAR SESSION
    ====================================================== */

    function clearSession() {

        localStorage.removeItem("token");

        localStorage.removeItem(
            "farmnestCurrentUser"
        );

        localStorage.removeItem("user");

        localStorage.removeItem(
            "farmnestRemember"
        );

    }


    /* ======================================================
       LOGOUT
    ====================================================== */

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            function () {

                clearSession();

                window.location.href =
                    "index.html";

            }
        );

    }


    /* ======================================================
       LOAD FEATURED PRODUCTS
    ====================================================== */

    async function loadFeaturedProducts() {

        if (!productContainer) {

            console.warn(
                "Product container not found."
            );

            return;
        }


        productContainer.innerHTML =
            `
            <p class="loading-products">
                Loading products...
            </p>
            `;


        try {

            const response =
                await fetch(
                    API_URL + "/products"
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to fetch products"
                );

            }


            const data =
                await response.json();


            console.log(
                "Home Page Products:",
                data
            );


            /*
                Backend response:

                {
                    message: "...",
                    count: 1,
                    products: [...]
                }
            */

            const products =
                data.products || [];


            /* ==================================================
               NO PRODUCTS
            ================================================== */

            if (products.length === 0) {

                productContainer.innerHTML =
                    `
                    <div class="no-products">

                        <i class="fas fa-box-open"></i>

                        <h3>
                            No Products Available
                        </h3>

                        <p>
                            Approved farmer products
                            will appear here.
                        </p>

                    </div>
                    `;

                return;
            }


            /* ==================================================
               SHOW FEATURED PRODUCTS
            ================================================== */

            productContainer.innerHTML = "";


            const featuredProducts =
                products.slice(0, 6);


            featuredProducts.forEach(
                function (product) {

                    const card =
                        createProductCard(product);

                    productContainer.appendChild(card);

                }
            );


            attachCartButtons();

            attachWishlistButtons();

        } catch (error) {

            console.error(
                "Home Page Backend Error:",
                error
            );


            productContainer.innerHTML =
                `
                <div class="no-products">

                    <i class="fas fa-triangle-exclamation"></i>

                    <h3>
                        Unable to Load Products
                    </h3>

                    <p>
                        Please make sure FarmNest
                        backend is running.
                    </p>

                </div>
                `;

        }

    }


    /* ======================================================
       CREATE PRODUCT CARD
    ====================================================== */

    function createProductCard(product) {

        const card =
            document.createElement("div");


        card.className =
            "product-card";


        card.dataset.productId =
            product._id;


        /* ------------------------------
           PRODUCT IMAGE
        ------------------------------ */

        const image =
            product.image
                ? "../images/" + product.image
                : "../images/vegetables.jpg";


        /* ------------------------------
           PRODUCT DATA
        ------------------------------ */

        const name =
            product.name ||
            "Farm Product";


        const description =
            product.description ||
            "Fresh farm product";


        const price =
            product.price || 0;


        const unit =
            product.unit || "Kg";


        /* ------------------------------
           PRODUCT CARD
        ------------------------------ */

        card.innerHTML =
            `
            <img
                src="${image}"
                alt="${name}"
                onerror="this.src='../images/vegetables.jpg'"
            >

            <div class="product-info">

                <h3>
                    ${name}
                </h3>

                <p>
                    ${description}
                </p>

                <div class="price">
                    ₹${price} / ${unit}
                </div>

                <div class="rating">
                    ★★★★★
                </div>

                <div class="product-buttons">

                    <button
                        class="cart-btn"
                        type="button"
                        data-product-id="${product._id}"
                    >
                        <i class="fa-solid fa-cart-shopping"></i>
                        Add Cart
                    </button>

                    <button
                        class="wishlist-btn"
                        type="button"
                        data-product-id="${product._id}"
                        aria-label="Add ${name} to Wishlist"
                    >
                        <i class="fa-solid fa-heart"></i>
                    </button>

                </div>

            </div>
            `;


        return card;

    }


    /* ======================================================
       ADD TO CART
    ====================================================== */

    function attachCartButtons() {

        const cartButtons =
            document.querySelectorAll(
                ".cart-btn"
            );


        cartButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const productId =
                            button.dataset.productId;


                        const card =
                            button.closest(
                                ".product-card"
                            );


                        if (!card) {
                            return;
                        }


                        const product = {

                            _id:
                                productId,

                            name:
                                card.querySelector(
                                    "h3"
                                )?.textContent.trim()
                                || "Farm Product",

                            description:
                                card.querySelector(
                                    "p"
                                )?.textContent.trim()
                                || "",

                            price:
                                parseFloat(
                                    card.querySelector(
                                        ".price"
                                    )?.textContent
                                        .replace(
                                            /[^\d.]/g,
                                            ""
                                        )
                                ) || 0,

                            image:
                                card.querySelector(
                                    "img"
                                )?.src || "",

                            quantity: 1

                        };


                        /* --------------------------
                           GET CART
                        -------------------------- */

                        let cart = [];


                        try {

                            cart =
                                JSON.parse(
                                    localStorage.getItem(
                                        "farmnestCart"
                                    )
                                ) || [];

                        } catch (error) {

                            cart = [];

                        }


                        /* --------------------------
                           EXISTING PRODUCT
                        -------------------------- */

                        const existing =
                            cart.find(
                                function (item) {

                                    return (
                                        item._id ===
                                        product._id
                                    );

                                }
                            );


                        if (existing) {

                            existing.quantity =
                                (existing.quantity || 1) + 1;

                        } else {

                            cart.push(product);

                        }


                        /* --------------------------
                           SAVE CART
                        -------------------------- */

                        localStorage.setItem(
                            "farmnestCart",
                            JSON.stringify(cart)
                        );


                        /* --------------------------
                           BUTTON FEEDBACK
                        -------------------------- */

                        button.innerHTML =
                            `
                            <i class="fas fa-check"></i>
                            Added
                            `;


                        setTimeout(
                            function () {

                                button.innerHTML =
                                    `
                                    <i class="fa-solid fa-cart-shopping"></i>
                                    Add Cart
                                    `;

                            },
                            1200
                        );

                    }
                );

            }
        );

    }


    /* ======================================================
       WISHLIST
    ====================================================== */

    function attachWishlistButtons() {

        const wishlistButtons =
            document.querySelectorAll(
                ".wishlist-btn"
            );


        wishlistButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const productId =
                            button.dataset.productId;


                        let wishlist = [];


                        try {

                            wishlist =
                                JSON.parse(
                                    localStorage.getItem(
                                        "farmnestWishlist"
                                    )
                                ) || [];

                        } catch (error) {

                            wishlist = [];

                        }


                        if (
                            wishlist.includes(
                                productId
                            )
                        ) {

                            wishlist =
                                wishlist.filter(
                                    id =>
                                        id !== productId
                                );

                            button.classList.remove(
                                "active"
                            );

                        } else {

                            wishlist.push(
                                productId
                            );

                            button.classList.add(
                                "active"
                            );

                        }


                        localStorage.setItem(
                            "farmnestWishlist",
                            JSON.stringify(wishlist)
                        );

                    }
                );

            }
        );

    }


    /* ======================================================
       START
    ====================================================== */

    loadCustomerAccount();

    loadFeaturedProducts();

});