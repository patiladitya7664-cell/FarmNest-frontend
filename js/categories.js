/* ==========================================================
   FARMNEST CART JS v1.0
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const cartItems = document.getElementById("cartItems");
    const itemCount = document.getElementById("itemCount");
    const subtotal = document.getElementById("subtotal");
    const total = document.getElementById("total");

    function displayCart() {

        if (!cartItems) return;

        cartItems.innerHTML = "";

        if (cart.length === 0) {

            cartItems.innerHTML = `
                <div class="empty-cart">
                    <h2>Your Cart is Empty</h2>
                    <p>Add some fresh farm products.</p>
                    <a href="HOMEPAGE/products.html" class="btn">
                        Shop Now
                    </a>
                </div>
            `;

            itemCount.innerText = "0";
            subtotal.innerText = "₹0";
            total.innerText = "₹0";

            return;
        }

        let sub = 0;

        cart.forEach((item, index) => {

            let price = parseInt(item.price.replace(/[^\d]/g, ""));

            sub += price;

            cartItems.innerHTML += `

            <div class="cart-item">

                <img src="${item.image}" alt="">

                <div class="cart-details">

                    <h3>${item.name}</h3>

                    <p>Fresh Farm Product</p>

                    <div class="cart-price">
                        ${item.price}
                    </div>

                    <div class="quantity">

                        <button onclick="decrease(${index})">-</button>

                        <span>${item.qty || 1}</span>

                        <button onclick="increase(${index})">+</button>

                    </div>

                    <button
                    class="remove-btn"
                    onclick="removeItem(${index})">

                    Remove

                    </button>

                </div>

            </div>

            `;

        });

        itemCount.innerText = cart.length;

        subtotal.innerText = "₹" + sub;

        total.innerText = "₹" + (sub + 50);

    }

    window.removeItem = function(index){

        cart.splice(index,1);

        localStorage.setItem("cart",JSON.stringify(cart));

        displayCart();

    }

    window.increase = function(index){

        if(!cart[index].qty){

            cart[index].qty=1;

        }

        cart[index].qty++;

        localStorage.setItem("cart",JSON.stringify(cart));

        displayCart();

    }

    window.decrease = function(index){

        if(!cart[index].qty){

            cart[index].qty=1;

        }

        if(cart[index].qty>1){

            cart[index].qty--;

        }

        localStorage.setItem("cart",JSON.stringify(cart));

        displayCart();

    }

    displayCart();

});