/* ==================================================
   FARMNEST ADMIN JAVASCRIPT
   Version 1.0
================================================== */


document.addEventListener("DOMContentLoaded",()=>{


/* ================= SIDEBAR ACTIVE ================= */


const menuLinks =
document.querySelectorAll(".menu a");


menuLinks.forEach(link=>{


    link.addEventListener("click",()=>{


        menuLinks.forEach(item=>{

            item.parentElement.classList.remove("active");

        });


        link.parentElement.classList.add("active");


    });


});







/* ================= ADD FARMER MODAL ================= */


const modal =
document.getElementById("farmerModal");


const addBtn =
document.querySelector(".btn-primary");


const closeBtn =
document.querySelector(".close-modal");





if(addBtn){


addBtn.addEventListener("click",()=>{


    modal.style.display="flex";


});


}




if(closeBtn){


closeBtn.addEventListener("click",()=>{


    modal.style.display="none";


});


}





window.addEventListener("click",(e)=>{


if(e.target===modal){


modal.style.display="none";


}


});









/* ================= SEARCH FARMER ================= */


const searchInput =
document.querySelector(".search-box input");



const rows =
document.querySelectorAll(".admin-table tbody tr");



if(searchInput){


searchInput.addEventListener("keyup",()=>{


let value =
searchInput.value.toLowerCase();



rows.forEach(row=>{


let text =
row.innerText.toLowerCase();



if(text.includes(value)){


row.style.display="";


}

else{


row.style.display="none";


}



});


});


}








/* ================= STATUS FILTER ================= */


const filter =
document.querySelector(".filter-box select");



if(filter){


filter.addEventListener("change",()=>{


let selected =
filter.value.toLowerCase();



rows.forEach(row=>{


let status =
row.querySelector(".status");



if(selected==="all status"){


row.style.display="";

}


else if(status.innerText.toLowerCase()===selected){


row.style.display="";


}

else{


row.style.display="none";


}



});


});


}








/* ================= FARMER ACTION BUTTONS ================= */



const approveButtons =
document.querySelectorAll(".approve");



approveButtons.forEach(btn=>{


btn.addEventListener("click",()=>{


let row =
btn.closest("tr");


let status =
row.querySelector(".status");



status.innerHTML="Approved";


status.className="status approved";



alert("Farmer Approved Successfully 🌾");


});


});







const rejectButtons =
document.querySelectorAll(".reject");



rejectButtons.forEach(btn=>{


btn.addEventListener("click",()=>{


let row =
btn.closest("tr");


let status =
row.querySelector(".status");



status.innerHTML="Rejected";


status.className="status rejected";



alert("Farmer Rejected");


});


});







const deleteButtons =
document.querySelectorAll(".delete");



deleteButtons.forEach(btn=>{


btn.addEventListener("click",()=>{


let confirmDelete =
confirm("Delete this farmer?");



if(confirmDelete){


btn.closest("tr").remove();



}


});


});








/* ================= FORM SUBMIT ================= */


const farmerForm =
document.querySelector(".farmer-form");



if(farmerForm){


farmerForm.addEventListener("submit",(e)=>{


e.preventDefault();


alert("Farmer Added Successfully 🌱");


modal.style.display="none";


farmerForm.reset();


});


}





});