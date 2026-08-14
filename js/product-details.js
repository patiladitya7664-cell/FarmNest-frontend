/* ==========================================================
   FARMNEST PRODUCT DETAILS JS
========================================================== */

// Quantity Increase / Decrease

const qtyInput = document.getElementById("qty");

function changeQty(value) {

    let qty = parseInt(qtyInput.value);

    qty += value;

    if (qty < 1) qty = 1;

    qtyInput.value = qty;

}

// Add To Cart

const addCartBtn = document.querySelector(".product-buttons .btn");

if(addCartBtn){

addCartBtn.addEventListener("click",()=>{

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const product = {

        name:"Fresh Organic Vegetables",

        price:120,

        image:"images/vegetables.jpg",

        quantity:parseInt(qtyInput.value)

    };

    cart.push(product);

    localStorage.setItem("cart",JSON.stringify(cart));

    alert("Product Added To Cart");

});

}

// Wishlist

const wishBtn = document.querySelector(".secondary");

if(wishBtn){

wishBtn.addEventListener("click",()=>{

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    wishlist.push({

        name:"Fresh Organic Vegetables",

        image:"images/vegetables.jpg"

    });

    localStorage.setItem("wishlist",JSON.stringify(wishlist));

    alert("Added To Wishlist");

});

}

// Image Zoom Effect

const productImage = document.getElementById("mainProductImage");

if(productImage){

productImage.addEventListener("mousemove",()=>{

productImage.style.transform="scale(1.1)";
productImage.style.transition=".4s";

});

productImage.addEventListener("mouseleave",()=>{

productImage.style.transform="scale(1)";

});

}