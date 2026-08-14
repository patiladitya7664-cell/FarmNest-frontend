// =====================================
// FARMNEST WAREHOUSE MANAGEMENT JS
// =====================================


document.addEventListener("DOMContentLoaded",()=>{



// ================================
// ADD WAREHOUSE BUTTON
// ================================


const addBtn =
document.querySelector(".add-btn");



addBtn.addEventListener("click",()=>{


let warehouseName =
prompt("Enter Warehouse Name");


if(warehouseName){


let location =
prompt("Enter Warehouse Location");



let warehouse = {


name:warehouseName,

location:location,

capacity:"0%"


};




let data =
JSON.parse(
localStorage.getItem("warehouses")
) || [];



data.push(warehouse);



localStorage.setItem(
"warehouses",
JSON.stringify(data)
);



alert(
"Warehouse Added Successfully 🌱"
);



location.reload();



}


});








// ================================
// MANAGE BUTTON
// ================================


const manageButtons =
document.querySelectorAll(
".warehouse-card button"
);



manageButtons.forEach(btn=>{


btn.addEventListener("click",()=>{


let card =
btn.closest(".warehouse-card");



let name =
card.querySelector("h3").innerText;



alert(
"Managing Warehouse : "+name
);



});


});








// ================================
// CAPACITY ALERT
// ================================


const capacityBars =
document.querySelectorAll(
".capacity span"
);



capacityBars.forEach(item=>{


let value =
parseInt(
item.innerText
);



if(value >= 85){


item.style.color="red";


item.innerHTML =
"⚠ High Capacity "+value+"%";


}


});








// ================================
// SAVE ACTIVITY
// ================================


let activities =
document.querySelector(".activity ul");



let savedActivity =
localStorage.getItem(
"warehouseActivity"
);



if(savedActivity){


activities.innerHTML =
savedActivity;


}






function saveActivity(){


localStorage.setItem(

"warehouseActivity",

activities.innerHTML

);


}





const addActivity = (text)=>{


let li =
document.createElement("li");


li.innerHTML =

`
<i class="fa fa-check"></i>
${text}
`;



activities.prepend(li);



saveActivity();


};






// Example activity

addActivity(
"Warehouse dashboard opened"
);






});