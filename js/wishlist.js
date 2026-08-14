// =====================================
// FARMNEST WISHLIST JAVASCRIPT
// =====================================


document.addEventListener("DOMContentLoaded",()=>{



// ================================
// GET WISHLIST DATA
// ================================


let wishlist = 
JSON.parse(
localStorage.getItem("wishlist")
) || [];



const container =
document.querySelector(
".wishlist-container"
);



const empty =
document.querySelector(
".empty"
);







// ================================
// DISPLAY WISHLIST
// ================================


function displayWishlist(){


container.innerHTML="";



if(wishlist.length===0){


container.style.display="none";

empty.style.display="block";

return;

}


else{

container.style.display="grid";

empty.style.display="none";

}






wishlist.forEach((product,index)=>{



let card =
document.createElement("div");


card.className="product-card";



card.innerHTML=`

<div class="heart">

<i class="fa fa-heart"></i>

</div>


<img src="${product.image}">


<h3>
${product.name}
</h3>


<p class="price">

₹${product.price} / Kg

</p>


<p>
${product.description}
</p>



<div class="buttons">


<button class="cart-btn"
data-index="${index}">

<i class="fa fa-cart-shopping"></i>

Add Cart

</button>



<button class="remove-btn"
data-index="${index}">

<i class="fa fa-trash"></i>

</button>



</div>

`;



container.appendChild(card);


});



addEvents();


}








// ================================
// BUTTON EVENTS
// ================================


function addEvents(){



// REMOVE ITEM


document
.querySelectorAll(".remove-btn")
.forEach(btn=>{


btn.addEventListener("click",()=>{


let index =
btn.dataset.index;



wishlist.splice(index,1);



localStorage.setItem(

"wishlist",

JSON.stringify(wishlist)

);



displayWishlist();



alert(
"Removed from Wishlist ❌"
);



});



});







// ADD TO CART


document
.querySelectorAll(".cart-btn")
.forEach(btn=>{


btn.addEventListener("click",()=>{


let index =
btn.dataset.index;



let cart =

JSON.parse(

localStorage.getItem("cart")

) || [];




cart.push(
wishlist[index]
);



localStorage.setItem(

"cart",

JSON.stringify(cart)

);




alert(
"Product Added To Cart 🛒"
);



});



});



}






// ================================
// INITIAL LOAD
// ================================


displayWishlist();




});