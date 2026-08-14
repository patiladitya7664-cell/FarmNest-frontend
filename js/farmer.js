/* ==========================================================
   FARMNEST FARMER DASHBOARD JS v1.0
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Sidebar Menu Items
    const menuItems = document.querySelectorAll(".sidebar ul li");

    // Dashboard Sections
    const sections = document.querySelectorAll(".content-section");

    // Default Section
    sections.forEach(section => {
        section.style.display = "none";
    });

    const dashboard = document.getElementById("dashboard");

    if (dashboard) {
        dashboard.style.display = "block";
    }

    // Menu Click Event
    menuItems.forEach(item => {

        item.addEventListener("click", function () {

            menuItems.forEach(li => li.classList.remove("active"));

            this.classList.add("active");

        });

    });

});


/* ==========================================================
   SHOW SECTION
========================================================== */

function showSection(sectionId) {

    const sections = document.querySelectorAll(".content-section");

    sections.forEach(section => {

        section.style.display = "none";

    });

    document.getElementById(sectionId).style.display = "block";

}


/* ==========================================================
   DASHBOARD STATS
========================================================== */

function animateValue(id, start, end, duration) {

    let current = start;

    const increment = (end - start) / (duration / 20);

    const obj = document.getElementById(id);

    if (!obj) return;

    const timer = setInterval(() => {

        current += increment;

        if (current >= end) {

            current = end;

            clearInterval(timer);

        }

        obj.innerHTML = Math.floor(current);

    }, 20);

}


/* ==========================================================
   NOTIFICATIONS
========================================================== */

function showNotification(message) {

    const notification = document.createElement("div");

    notification.className = "notification";

    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {

        notification.classList.add("show");

    }, 100);

    setTimeout(() => {

        notification.classList.remove("show");

        setTimeout(() => {

            notification.remove();

        }, 400);

    }, 3000);

}


/* ==========================================================
   SAMPLE BUTTON EVENTS
========================================================== */

document.addEventListener("click", function(e){

    if(e.target.classList.contains("sample-btn")){

        showNotification("Operation Successful!");

    }

});
/* ==========================================================
   MY CROPS
========================================================== */

let crops = JSON.parse(localStorage.getItem("crops")) || [];

const cropContainer = document.getElementById("cropContainer");

function saveCrops(){

localStorage.setItem("crops",JSON.stringify(crops));

}

function displayCrops(){

if(!cropContainer) return;

cropContainer.innerHTML="";

crops.forEach((crop,index)=>{

cropContainer.innerHTML+=`

<div class="crop-card">

<h3>${crop.name}</h3>

<p><strong>Quantity :</strong> ${crop.qty} Kg</p>

<p><strong>Price :</strong> ₹${crop.price}/Kg</p>

<p><strong>Harvest :</strong> ${crop.date}</p>

<div class="crop-actions">

<button class="edit-btn"
onclick="editCrop(${index})">

Edit

</button>

<button class="delete-btn"
onclick="deleteCrop(${index})">

Delete

</button>

</div>

</div>

`;

});

}

const addCropBtn=document.getElementById("addCropBtn");

if(addCropBtn){

addCropBtn.onclick=function(){

const name=document.getElementById("cropName").value;

const qty=document.getElementById("cropQty").value;

const price=document.getElementById("cropPrice").value;

const date=document.getElementById("harvestDate").value;

if(name==""||qty==""||price==""){

alert("Fill all fields");

return;

}

crops.push({

name,

qty,

price,

date

});

saveCrops();

displayCrops();

document.getElementById("cropName").value="";

document.getElementById("cropQty").value="";

document.getElementById("cropPrice").value="";

document.getElementById("harvestDate").value="";

showNotification("Crop Added Successfully");

}

}

function deleteCrop(index){

if(confirm("Delete this crop?")){

crops.splice(index,1);

saveCrops();

displayCrops();

showNotification("Crop Deleted");

}

}

function editCrop(index){

const crop=crops[index];

document.getElementById("cropName").value=crop.name;

document.getElementById("cropQty").value=crop.qty;

document.getElementById("cropPrice").value=crop.price;

document.getElementById("harvestDate").value=crop.date;

crops.splice(index,1);

saveCrops();

displayCrops();

}

displayCrops();
/* ==========================================================
   SMART STORAGE
========================================================== */

function updateStorage(){

const capacity=Math.floor(Math.random()*25)+70;

const temp=Math.floor(Math.random()*8)+20;

const hum=Math.floor(Math.random()*15)+50;

const capacityBar=document.getElementById("capacityBar");

const capacityText=document.getElementById("capacityText");

const temperature=document.getElementById("temperature");

const humidity=document.getElementById("humidity");

if(capacityBar){

capacityBar.style.width=capacity+"%";

capacityText.innerHTML=capacity+"% Used";

}

if(temperature){

temperature.innerHTML=temp+"°C";

}

if(humidity){

humidity.innerHTML=hum+"%";

}

}

updateStorage();

setInterval(updateStorage,5000);
/* ==========================================================
   WAREHOUSE BOOKING
========================================================== */

let bookings = JSON.parse(localStorage.getItem("warehouseBookings")) || [];

function saveBookings(){

    localStorage.setItem(
        "warehouseBookings",
        JSON.stringify(bookings)
    );

}

function displayBookings(){

    const bookingList = document.getElementById("bookingList");

    if(!bookingList) return;

    if(bookings.length===0){

        bookingList.innerHTML="No bookings yet.";

        return;

    }

    bookingList.innerHTML="";

    bookings.forEach(item=>{

        bookingList.innerHTML += `

        <div class="booking-item">

            <strong>${item.name}</strong><br>

            Booking Date :
            ${item.date}

        </div>

        `;

    });

}

function bookWarehouse(name){

    const booking={

        name:name,

        date:new Date().toLocaleDateString()

    };

    bookings.push(booking);

    saveBookings();

    displayBookings();

    showNotification(name+" Booked Successfully");

}

displayBookings();
/* ==========================================================
   ORDERS MANAGEMENT
========================================================== */

let orders = [

{
id:"FN1001",
customer:"Rahul Sharma",
product:"Organic Wheat",
quantity:"25 Kg",
status:"Pending"
},

{
id:"FN1002",
customer:"Priya Patel",
product:"Fresh Tomatoes",
quantity:"15 Kg",
status:"Accepted"
},

{
id:"FN1003",
customer:"Amit Verma",
product:"Rice",
quantity:"40 Kg",
status:"Dispatched"
}

];

const ordersContainer=document.getElementById("ordersContainer");

function displayOrders(){

if(!ordersContainer) return;

ordersContainer.innerHTML="";

orders.forEach((order,index)=>{

let cls="pending";

if(order.status==="Accepted") cls="accepted";
if(order.status==="Dispatched") cls="dispatched";
if(order.status==="Delivered") cls="delivered";

ordersContainer.innerHTML+=`

<div class="order-card">

<h3>${order.id}</h3>

<p><strong>Customer :</strong> ${order.customer}</p>

<p><strong>Product :</strong> ${order.product}</p>

<p><strong>Quantity :</strong> ${order.quantity}</p>

<div class="order-status ${cls}">

${order.status}

</div>

<div class="order-actions">

<button class="accept-btn"
onclick="updateOrder(${index},'Accepted')">

Accept

</button>

<button class="dispatch-btn"
onclick="updateOrder(${index},'Dispatched')">

Dispatch

</button>

<button class="deliver-btn"
onclick="updateOrder(${index},'Delivered')">

Deliver

</button>

<button class="reject-btn"
onclick="deleteOrder(${index})">

Reject

</button>

</div>

</div>

`;

});

}

function updateOrder(index,status){

orders[index].status=status;

displayOrders();

showNotification("Order "+status);

}

function deleteOrder(index){

if(confirm("Reject this order?")){

orders.splice(index,1);

displayOrders();

showNotification("Order Rejected");

}

}

displayOrders();
/* ==========================================================
   EARNINGS DASHBOARD
========================================================== */

const transactions = [

{
order:"FN1001",
customer:"Rahul Sharma",
product:"Organic Wheat",
amount:"₹3,250",
status:"Paid"
},

{
order:"FN1002",
customer:"Priya Patel",
product:"Tomatoes",
amount:"₹1,850",
status:"Paid"
},

{
order:"FN1003",
customer:"Amit Verma",
product:"Rice",
amount:"₹5,200",
status:"Paid"
},

{
order:"FN1004",
customer:"Sneha Joshi",
product:"Onion",
amount:"₹2,150",
status:"Paid"
}

];

function loadTransactions(){

const table=document.getElementById("earningTable");

if(!table) return;

table.innerHTML="";

transactions.forEach(item=>{

table.innerHTML+=`

<tr>

<td>${item.order}</td>

<td>${item.customer}</td>

<td>${item.product}</td>

<td>${item.amount}</td>

<td style="color:green;font-weight:bold;">

${item.status}

</td>

</tr>

`;

});

}

loadTransactions();
/* ==========================================================
   FARMER PROFILE
========================================================== */

function saveProfile(){

const profile={

name:document.getElementById("farmerName").value,

email:document.getElementById("farmerEmail").value,

phone:document.getElementById("farmerPhone").value,

farm:document.getElementById("farmName").value,

location:document.getElementById("farmLocation").value,

address:document.getElementById("farmerAddress").value

};

localStorage.setItem(

"farmerProfile",

JSON.stringify(profile)

);

showNotification("Profile Saved Successfully");

}

function loadProfile(){

const profile=JSON.parse(

localStorage.getItem("farmerProfile")

);

if(!profile) return;

document.getElementById("farmerName").value=profile.name||"";

document.getElementById("farmerEmail").value=profile.email||"";

document.getElementById("farmerPhone").value=profile.phone||"";

document.getElementById("farmName").value=profile.farm||"";

document.getElementById("farmLocation").value=profile.location||"";

document.getElementById("farmerAddress").value=profile.address||"";

}

loadProfile();

/* ================= IMAGE PREVIEW ================= */

const profileImage=document.getElementById("profileImage");

if(profileImage){

profileImage.addEventListener("change",function(e){

const file=e.target.files[0];

if(file){

const reader=new FileReader();

reader.onload=function(){

document.getElementById("profilePreview").src=reader.result;

localStorage.setItem(

"profileImage",

reader.result

);

}

reader.readAsDataURL(file);

}

});

}

const savedImage=localStorage.getItem("profileImage");

if(savedImage){

document.getElementById("profilePreview").src=savedImage;

}