/* =====================================================
   FARMNEST CART PAGE FUNCTIONALITY
===================================================== */


document.addEventListener("DOMContentLoaded",()=>{


const cartContainer =
document.getElementById("cartContainer");


if(!cartContainer)
return;



let cart =
JSON.parse(
localStorage.getItem("cart")
)
||
[];





function displayCart(){


cartContainer.innerHTML="";



if(cart.length===0){


cartContainer.innerHTML=`

<div class="empty-cart">

<i class="fa-solid fa-cart-shopping"></i>

<h2>
Your Cart Is Empty
</h2>

<p>
Add fresh farm products to continue shopping.
</p>


<a href="products.html" class="btn">

Shop Now

</a>

</div>

`;



updateSummary();

return;


}






cart.forEach((item,index)=>{


cartContainer.innerHTML += `


<div class="cart-item">


<img src="${item.image}">


<div>


<h3>
${item.name}
</h3>


<p>
${item.price}
</p>



<div class="quantity-box">


<button onclick="decreaseQty(${index})">

-

</button>



<span>

${item.quantity || 1}

</span>



<button onclick="increaseQty(${index})">

+

</button>


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



updateSummary();


}









function updateSummary(){



let totalItems=0;


let totalPrice=0;



cart.forEach(item=>{


let qty =
item.quantity || 1;



totalItems += qty;



let price = Number(item.price) || 0;

totalPrice += price * qty;



});




let itemsElement =
document.getElementById("totalItems");


let priceElement =
document.getElementById("totalPrice");



if(itemsElement)

itemsElement.innerText =
totalItems;



if(priceElement)

priceElement.innerText =
"₹"+totalPrice;



}









window.increaseQty=function(index){



cart[index].quantity =
(cart[index].quantity || 1)+1;



saveCart();



};








window.decreaseQty=function(index){



if(
(cart[index].quantity || 1)>1
){


cart[index].quantity--;


saveCart();


}



};









window.removeItem=function(index){



cart.splice(index,1);



saveCart();


};









function saveCart(){


localStorage.setItem(
"cart",
JSON.stringify(cart)
);



displayCart();



}






displayCart();



});