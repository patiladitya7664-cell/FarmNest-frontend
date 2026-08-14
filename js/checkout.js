/* ==========================================================
   FARMNEST CHECKOUT JS v1.0
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const checkoutItems = document.getElementById("checkoutItems");
    const checkoutTotal = document.getElementById("checkoutTotal");
    const checkoutForm = document.getElementById("checkoutForm");

    function loadCheckout() {

        if (!checkoutItems) return;

        checkoutItems.innerHTML = "";

        if (cart.length === 0) {

            checkoutItems.innerHTML = `
                <h3>Your Cart is Empty</h3>
                <a href="HOMEPAGE/products.html" class="btn">
                    Shop Products
                </a>
            `;

            checkoutTotal.innerHTML = "₹0";

            return;

        }

        let subtotal = 0;

        cart.forEach(item => {

            const qty = item.qty || 1;

            const price = parseInt(item.price.replace(/[^\d]/g, ""));

            subtotal += price * qty;

            checkoutItems.innerHTML += `

            <div class="checkout-item">

                <div>

                    <h4>${item.name}</h4>

                    <small>Qty : ${qty}</small>

                </div>

                <span>₹${price * qty}</span>

            </div>

            `;

        });

        checkoutTotal.innerHTML = "₹" + (subtotal + 50);

    }

    if (checkoutForm) {

        checkoutForm.addEventListener("submit", function(e) {

            e.preventDefault();

            if(cart.length===0){

                alert("Your cart is empty.");

                return;

            }

            alert("🎉 Order Placed Successfully!");

            localStorage.removeItem("cart");

            window.location.href="tracking.html";

        });

    }

    loadCheckout();

});