/* ==========================================================
   FARMNEST PRODUCTS JS v1.0
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const search = document.getElementById("search");
    const category = document.getElementById("category");
    const cards = document.querySelectorAll(".product-card");

    /* =============================
       PRODUCT SEARCH
    ============================== */

    if (search) {

        search.addEventListener("keyup", () => {

            const value = search.value.toLowerCase();

            cards.forEach(card => {

                const name = card.querySelector("h3").textContent.toLowerCase();

                if (name.includes(value)) {

                    card.style.display = "block";

                } else {

                    card.style.display = "none";

                }

            });

        });

    }

    /* =============================
       CATEGORY FILTER
    ============================== */

    if (category) {

        category.addEventListener("change", () => {

            const selected = category.value.toLowerCase();

            cards.forEach(card => {

                const title = card.querySelector("h3").textContent.toLowerCase();

                if (selected === "all categories") {

                    card.style.display = "block";

                }

                else if (title.includes(selected.replace(" ", "")) || title.includes(selected)) {

                    card.style.display = "block";

                }

                else {

                    card.style.display = "none";

                }

            });

        });

    }

    /* =============================
       ADD TO CART
    ============================== */

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    document.querySelectorAll(".cart-btn").forEach(button => {

        button.addEventListener("click", function () {

            const card = this.closest(".product-card");

            const product = {

                name: card.querySelector("h3").innerText,

                price: card.querySelector(".price").innerText,

                image: card.querySelector("img").src

            };

            cart.push(product);

            localStorage.setItem("cart", JSON.stringify(cart));

            alert(product.name + " added to Cart");

        });

    });

    /* =============================
       WISHLIST
    ============================== */

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    document.querySelectorAll(".wishlist-btn").forEach(button => {

        button.addEventListener("click", function () {

            const card = this.closest(".product-card");

            const product = {

                name: card.querySelector("h3").innerText,

                price: card.querySelector(".price").innerText,

                image: card.querySelector("img").src

            };

            wishlist.push(product);

            localStorage.setItem("wishlist", JSON.stringify(wishlist));

            this.innerHTML = '<i class="fa-solid fa-heart"></i>';

            this.style.background = "#ff4d4d";

            this.style.color = "#fff";

            alert(product.name + " added to Wishlist");

        });

    });

});
/* =====================================================
   FARMNEST PRODUCTS FUNCTIONALITY
===================================================== */


document.addEventListener("DOMContentLoaded",()=>{



/* ================= PRODUCT SEARCH ================= */


const searchBox =
document.getElementById("productSearch");


const filter =
document.getElementById("categoryFilter");


const products =
document.querySelectorAll(".product-card");



function filterProducts(){


let searchValue =
searchBox.value.toLowerCase();



let categoryValue =
filter.value;



products.forEach(product=>{


let name =
product.querySelector("h3")
.innerText
.toLowerCase();



let category =
product.dataset.category;



if(

name.includes(searchValue)

&&

(categoryValue==="all" || category===categoryValue)

){


product.style.display="block";


}

else{


product.style.display="none";


}


});


}



if(searchBox){


searchBox.addEventListener(
"keyup",
filterProducts
);


}



if(filter){


filter.addEventListener(
"change",
filterProducts
);


}







/* ================= ADD TO CART ================= */


const cartButtons =
document.querySelectorAll(
".product-card button"
);



cartButtons.forEach(button=>{


button.addEventListener(
"click",
()=>{


let card =
button.closest(".product-card");



let product = {


name:
card.querySelector("h3").innerText,


price:
card.querySelector(".price").innerText,


image:
card.querySelector("img").src


};




let cart =
JSON.parse(
localStorage.getItem("cart")
)
||
[];




cart.push(product);



localStorage.setItem(
"cart",
JSON.stringify(cart)
);




alert(
product.name+
" Added To Cart 🛒"
);



});


});








/* ================= WISHLIST ================= */


const wishlistButtons =
document.querySelectorAll(
".wishlist"
);



wishlistButtons.forEach(btn=>{


btn.addEventListener(
"click",
()=>{


let card =
btn.closest(".product-card");



let wishlist =
JSON.parse(
localStorage.getItem("wishlist")
)
||
[];




wishlist.push({

name:
card.querySelector("h3").innerText,


image:
card.querySelector("img").src


});



localStorage.setItem(
"wishlist",
JSON.stringify(wishlist)
);



btn.style.background="#ffebee";


alert(
"Added to Wishlist ❤️"
);



});


});



});