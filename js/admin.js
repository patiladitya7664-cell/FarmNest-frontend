/* ==========================================================
   FARMNEST ADMIN PANEL
========================================================== */

document.addEventListener("DOMContentLoaded",()=>{

showAdminSection("dashboard");

loadFarmers();

loadCustomers();

loadProducts();

loadOrders();

});

/* ===============================
   SECTION SWITCH
================================ */

function showAdminSection(sectionId){

document.querySelectorAll(".admin-section").forEach(sec=>{

sec.classList.remove("active-section");

});

document.getElementById(sectionId).classList.add("active-section");

document.querySelectorAll(".sidebar li").forEach(li=>{

li.classList.remove("active");

});

event.target.classList.add("active");

}

/* ===============================
   SAMPLE DATA
================================ */

const farmers=[

{
name:"Ramesh Patil",
location:"Pune",
crops:"Wheat"
},

{
name:"Suresh Kale",
location:"Nashik",
crops:"Tomato"
}

];

const customers=[

{
name:"Rahul Sharma",
city:"Mumbai"
},

{
name:"Priya Patel",
city:"Pune"
}

];

const products=[

{
name:"Organic Rice",
price:"₹70"
},

{
name:"Fresh Onion",
price:"₹30"
}

];

const orders=[

{
id:"FN1001",
status:"Delivered"
},

{
id:"FN1002",
status:"Pending"
}

];

/* ===============================
   LOAD TABLES
================================ */

function createTable(data,containerId){

const container=document.getElementById(containerId);

if(!container) return;

if(data.length===0){

container.innerHTML="<p>No Data</p>";

return;

}

let html="<table class='admin-table'><tr>";

Object.keys(data[0]).forEach(key=>{

html+=`<th>${key}</th>`;

});

html+="<th>Action</th></tr>";

data.forEach((item,index)=>{

html+="<tr>";

Object.values(item).forEach(value=>{

html+=`<td>${value}</td>`;

});

html+=`

<td>

<button class="edit-btn">

Edit

</button>

<button class="delete-btn"

onclick="deleteRow('${containerId}',${index})">

Delete

</button>

</td>

`;

html+="</tr>";

});

html+="</table>";

container.innerHTML=html;

}

function loadFarmers(){

createTable(farmers,"farmerTable");

}

function loadCustomers(){

createTable(customers,"customerTable");

}

function loadProducts(){

createTable(products,"productTable");

}

function loadOrders(){

createTable(orders,"orderTable");

}

/* ===============================
   DELETE
================================ */

function deleteRow(type,index){

alert("Delete feature will connect with database.");

}