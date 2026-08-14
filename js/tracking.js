/* ==========================================================
   FARMNEST TRACKING JS v1.0
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Estimated Delivery Date
    const deliveryText = document.querySelector(".delivery-box p");

    if (deliveryText) {

        const today = new Date();

        today.setDate(today.getDate() + 1);

        const options = {
            weekday: "long",
            day: "numeric",
            month: "long"
        };

        deliveryText.innerHTML =
            today.toLocaleDateString("en-IN", options) +
            " before 7:00 PM";
    }

    // Progress Animation
    const steps = document.querySelectorAll(".step");
    const lines = document.querySelectorAll(".line");

    let current = 0;

    function updateTracking() {

        if (current < steps.length) {

            steps[current].classList.add("active");

            if (current > 0) {

                lines[current - 1].classList.add("active");

            }

            current++;

        }
    }

    // Initial State
    steps.forEach(step => step.classList.remove("active"));
    lines.forEach(line => line.classList.remove("active"));

    updateTracking();

    const interval = setInterval(() => {

        if (current < steps.length) {

            updateTracking();

        } else {

            clearInterval(interval);

        }

    }, 2000);

});
/* =====================================================
   FARMNEST ORDER TRACKING FUNCTIONALITY
===================================================== */


document.addEventListener("DOMContentLoaded",()=>{


const trackingPage =
document.querySelector(".tracking-section");



if(!trackingPage)
return;



let orders =
JSON.parse(
localStorage.getItem("orders")
)
||
[];




const orderBox =
document.querySelector(".order-box");



if(orders.length > 0){



let latestOrder =
orders[orders.length-1];



let orderId =
"FN"+Date.now()
.toString()
.slice(-6);





orderBox.innerHTML = `


<h2>
Order Details
</h2>


<p>

Order ID:

<strong>
#${orderId}
</strong>

</p>



<p>

Status:

<span class="status">
Out For Delivery
</span>


</p>



<p>

Order Date:

${latestOrder.date}

</p>


<p>

Total Amount:

<strong>
₹${latestOrder.amount}
</strong>


</p>


`;



}






/* ================= AUTO DELIVERY STATUS ================= */


let steps =
document.querySelectorAll(".step");



let currentStep = 0;



function updateTracking(){



if(currentStep < steps.length){


steps[currentStep]
.classList.add("active");



currentStep++;


}



}



setInterval(
updateTracking,
3000
);






});