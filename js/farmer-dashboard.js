// =====================================
// FARMNEST FARMER DASHBOARD JS
// =====================================


document.addEventListener("DOMContentLoaded",()=>{


// ================================
// ACTIVE SIDEBAR MENU
// ================================


const currentPage = window.location.pathname.split("/").pop();


document.querySelectorAll(".sidebar ul li a")
.forEach(link=>{


    const linkPage = link
    .getAttribute("href");


    if(linkPage === currentPage){

        link.parentElement.classList.add("active");

    }


});





// ================================
// LOAD FARMER DATA
// ================================


let farmerName =
localStorage.getItem("farmerName");


if(farmerName){

    document.querySelector(".profile span")
    .innerText = farmerName;

}






// ================================
// CARD COUNTER ANIMATION
// ================================


const counters =
document.querySelectorAll(".card h3");



counters.forEach(counter=>{


let target =
parseInt(
counter.innerText
.replace(/[₹,]/g,"")
);



let count = 0;


let speed =
target/80;



let update = ()=>{


if(count < target){

count += speed;


counter.innerText =
Math.ceil(count);


setTimeout(update,20);


}

else{


if(target > 5000){

counter.innerText =
"₹"+target.toLocaleString();

}

else{

counter.innerText =
target;

}


}



};


update();



});








// ================================
// QUICK ACTION BUTTONS
// ================================


const buttons =
document.querySelectorAll(".quick button");



buttons[0].onclick=()=>{

window.location.href="add-product.html";

}



buttons[1].onclick=()=>{

window.location.href="inventory.html";

}



buttons[2].onclick=()=>{

window.location.href="analytics.html";

}






// ================================
// WELCOME MESSAGE
// ================================


setTimeout(()=>{


console.log(
"🌿 Welcome to FarmNest Farmer Dashboard"
);


},500);






});