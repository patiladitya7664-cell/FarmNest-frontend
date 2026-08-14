/* =====================================
   FARMNEST CUSTOMER JAVASCRIPT
===================================== */


document.addEventListener("DOMContentLoaded",()=>{


// Customer Modal


const modal =
document.getElementById("customerModal");


const addCustomer =
document.querySelector(".btn-primary");



const close =
document.querySelector(".close-modal");





if(addCustomer){


addCustomer.onclick=()=>{


modal.style.display="flex";


};


}





if(close){


close.onclick=()=>{


modal.style.display="none";


};


}






// Delete Customer


const deleteButtons =
document.querySelectorAll(".delete");



deleteButtons.forEach(btn=>{


btn.addEventListener("click",()=>{


let confirmDelete =
confirm(
"Delete this customer?"
);



if(confirmDelete){


btn.closest("tr").remove();


alert(
"Customer Deleted Successfully"
);


}


});


});







// Block / Unblock Customer


const approveButtons =
document.querySelectorAll(".approve");



approveButtons.forEach(btn=>{


btn.addEventListener("click",()=>{


let row =
btn.closest("tr");


let status =
row.querySelector(".status");



status.innerHTML="Active";


status.className="status active";



alert(
"Customer Activated"
);


});


});






});