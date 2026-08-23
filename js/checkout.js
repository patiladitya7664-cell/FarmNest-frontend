/* ==========================================================
   FARMNEST CHECKOUT JS v2.0
   CUSTOMER → ORDER API
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "http://localhost:5000/api/orders";

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const checkoutItems =
        document.getElementById("checkoutItems");

    const checkoutTotal =
        document.getElementById("checkoutTotal");

    const checkoutForm =
        document.getElementById("checkoutForm");


    /* =====================================================
       LOAD CHECKOUT
    ===================================================== */

    function loadCheckout() {

        if (!checkoutItems) return;

        checkoutItems.innerHTML = "";

        if (cart.length === 0) {

            checkoutItems.innerHTML = `
                <h3>Your Cart is Empty</h3>

                <a href="products.html" class="btn">
                    Shop Products
                </a>
            `;

            checkoutTotal.innerHTML = "₹0";

            return;
        }


        let subtotal = 0;


        cart.forEach(item => {

            const qty = item.quantity || 1;

            const price = Number(item.price) || 0;

            subtotal += price * qty;


            checkoutItems.innerHTML += `

                <div class="checkout-item">

                    <div>

                        <h4>
                            ${item.name}
                        </h4>

                        <small>
                            Qty : ${qty} ${item.unit || "kg"}
                        </small>

                    </div>

                    <span>
                        ₹${price * qty}
                    </span>

                </div>

            `;

        });


        // Delivery charge
        const deliveryCharge = 50;

        const total = subtotal + deliveryCharge;

        checkoutTotal.innerHTML = "₹" + total;

    }


    /* =====================================================
       PLACE ORDER
    ===================================================== */

    if (checkoutForm) {

        checkoutForm.addEventListener("submit", async function(e) {

            e.preventDefault();


            if (cart.length === 0) {

                alert("Your cart is empty.");

                return;
            }


            /* =================================================
               GET CUSTOMER DETAILS
            ================================================= */

            const inputs =
                checkoutForm.querySelectorAll(
                    "input, textarea"
                );


            const name =
                inputs[0]?.value.trim();

            const email =
                inputs[1]?.value.trim();

            const phone =
                inputs[2]?.value.trim();

            const address =
                inputs[3]?.value.trim();

             const city =
                 inputs[4]?.value.trim();

            const state =
                 inputs[5]?.value.trim();

            const pincode =
                 inputs[6]?.value.trim();   


            if (!name || !email || !phone || !address || !city || !state || !pincode) {
              alert("Please fill all delivery details.");
              return;
            }


            /* =================================================
               PAYMENT METHOD
            ================================================= */

            const paymentInput =
                checkoutForm.querySelector(
                    'input[name="payment"]:checked'
                );


            let paymentMethod = "COD";


            if (
                paymentInput &&
                paymentInput.nextSibling
            ) {

                const paymentText =
                    paymentInput.parentElement
                        .innerText
                        .trim();


                if (
                    paymentText
                        .toLowerCase()
                        .includes("upi") ||
                    paymentText
                        .toLowerCase()
                        .includes("card")
                ) {

                    paymentMethod = "Online";

                }

            }


            /* =================================================
               SHIPPING ADDRESS
            ================================================= */

            const shippingAddress = {
                name: name,
                phone: phone,
                address: address,
                city: city,
                state: state,
                pincode: pincode
            };


            /* =================================================
               PRODUCTS FOR BACKEND
            ================================================= */

            const products = cart.map(item => ({

                productId: item.productId,

                quantity: item.quantity || 1

            }));


            try {

                const token =
                    localStorage.getItem("token");


                if (!token) {

                    alert(
                        "Please login before placing an order."
                    );

                    return;

                }


                /* =================================================
                   DISABLE BUTTON
                ================================================= */

                const submitButton =
                    checkoutForm.querySelector(
                        'button[type="submit"]'
                    );


                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.innerText =
                        "Placing Order...";

                }


                /* =================================================
                   CREATE ORDER
                ================================================= */

                const response =
                    await fetch(API_URL, {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token

                        },

                        body: JSON.stringify({

                            products,

                            shippingAddress,

                            paymentMethod

                        })

                    });


                const data =
                    await response.json();


                /* =================================================
                   API ERROR
                ================================================= */

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to place order"
                    );

                }


                /* =================================================
                   SUCCESS
                ================================================= */

                console.log(
                    "Order Created:",
                    data.order
                );


                alert(
                    "🎉 Order placed successfully!"
                );


                // Clear cart
                localStorage.removeItem("cart");


                // Save latest order ID
                localStorage.setItem(
                    "lastOrderId",
                    data.order._id
                );


                // Go to tracking
                window.location.href =
                    "tracking.html";


            } catch (error) {

                console.error(
                    "Order Error:",
                    error
                );


                alert(
                    error.message ||
                    "Failed to place order."
                );


                const submitButton =
                    checkoutForm.querySelector(
                        'button[type="submit"]'
                    );


                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.innerText =
                        "Place Order";

                }

            }

        });

    }


    /* =====================================================
       START
    ===================================================== */

    loadCheckout();

});