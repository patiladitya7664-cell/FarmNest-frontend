/* =====================================================
   FARMNEST PROFILE FUNCTIONALITY
===================================================== */


document.addEventListener("DOMContentLoaded",()=>{


const profilePage =
document.querySelector(".profile-section");



if(!profilePage)
return;





/* ================= LOAD USER DATA ================= */


let user =
JSON.parse(
localStorage.getItem("user")
)
||
null;



const nameElement =
document.querySelector(".profile-card h2");



if(user && nameElement){


nameElement.innerText =
user.name;


}







/* ================= ORDER COUNT ================= */


let orders =
JSON.parse(
localStorage.getItem("orders")
)
||
[];




let orderCard =
document.querySelector(
".detail-card:nth-child(1) p"
);



if(orderCard){


orderCard.innerText =

orders.length +

" Orders Completed";


}







/* ================= WISHLIST COUNT ================= */


let wishlist =
JSON.parse(
localStorage.getItem("wishlist")
)
||
[];




let wishlistCard =
document.querySelector(
".detail-card:nth-child(2) p"
);



if(wishlistCard){


wishlistCard.innerText =

wishlist.length +

" Saved Products";


}







/* ================= LOGOUT ================= */


const logoutBtn =
document.querySelector(".logout-btn");



if(logoutBtn){


logoutBtn.addEventListener(
"click",
()=>{



localStorage.removeItem(
"user"
);



alert(
"Logged Out Successfully 👋"
);



window.location.href =
"login.html";



});


}




});
