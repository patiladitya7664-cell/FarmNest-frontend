
/* =====================================================
   FARMNEST ADMIN DELIVERY MANAGEMENT
   ===================================================== */


/* ================= SEARCH DELIVERY ================= */

const searchInput = document.getElementById("searchDelivery");

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const searchValue = this.value.toLowerCase().trim();

        const rows = document.querySelectorAll("#deliveryTable tr");

        rows.forEach(row => {

            const rowText = row.textContent.toLowerCase();

            row.style.display =
                rowText.includes(searchValue) ? "" : "none";

        });

    });

}


/* ================= STATUS FILTER ================= */

const statusFilter = document.getElementById("statusFilter");

if (statusFilter) {

    statusFilter.addEventListener("change", function () {

        const selectedStatus = this.value;

        const rows = document.querySelectorAll("#deliveryTable tr");

        rows.forEach(row => {

            const rowStatus = row.dataset.status;

            if (
                selectedStatus === "all" ||
                rowStatus === selectedStatus
            ) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }

        });

    });

}


/* ================= DELIVERY DATA ================= */

const deliveryData = {

    FN1001: {
        customer: "Rahul Sharma",
        boy: "Rohit Patil",
        pickup: "FarmNest Warehouse A",
        destination: "Nagpur City",
        amount: "₹1,250",
        phone: "9876543210",
        status: "Out for Delivery"
    },

    FN1002: {
        customer: "Priya Verma",
        boy: "Amit Singh",
        pickup: "FarmNest Warehouse B",
        destination: "Wardha Road",
        amount: "₹850",
        phone: "9123456780",
        status: "Pending"
    },

    FN1003: {
        customer: "Amit Joshi",
        boy: "Vikas More",
        pickup: "FarmNest Warehouse C",
        destination: "Sitabuldi",
        amount: "₹1,560",
        phone: "9988776655",
        status: "Delivered"
    }

};


/* ================= VIEW DELIVERY ================= */

function viewDelivery(orderId) {

    const delivery = deliveryData[orderId];

    if (!delivery) {

        alert("Delivery information not found.");

        return;
    }


    document.getElementById("modalOrder").textContent =
        "#" + orderId;

    document.getElementById("modalCustomer").textContent =
        delivery.customer;

    document.getElementById("modalBoy").textContent =
        delivery.boy;

    document.getElementById("modalPickup").textContent =
        delivery.pickup;

    document.getElementById("modalDestination").textContent =
        delivery.destination;

    document.getElementById("modalAmount").textContent =
        delivery.amount;


    const modal =
        document.getElementById("deliveryModal");

    modal.classList.add("show");


    /* Store currently selected order */

    modal.dataset.orderId = orderId;

}


/* ================= CLOSE MODAL ================= */

function closeModal() {

    const modal =
        document.getElementById("deliveryModal");

    modal.classList.remove("show");

}


/* ================= TRACK DELIVERY ================= */

function trackDelivery(orderId) {

    const delivery = deliveryData[orderId];

    if (!delivery) {

        alert("Delivery information not found.");

        return;
    }


    alert(
        "🚚 DELIVERY TRACKING\n\n" +
        "Order: #" + orderId + "\n" +
        "Customer: " + delivery.customer + "\n" +
        "Delivery Boy: " + delivery.boy + "\n" +
        "Status: " + delivery.status + "\n" +
        "Destination: " + delivery.destination
    );

}


/* ================= CALL CUSTOMER ================= */

function callCustomer() {

    const modal =
        document.getElementById("deliveryModal");

    const orderId =
        modal.dataset.orderId;

    const delivery =
        deliveryData[orderId];


    if (!delivery) {

        alert("Customer information not found.");

        return;
    }


    const confirmCall = confirm(
        "Call " +
        delivery.customer +
        " at " +
        delivery.phone +
        "?"
    );


    if (confirmCall) {

        window.location.href =
            "tel:" + delivery.phone;

    }

}


/* ================= SEND OTP ================= */

function sendOTP() {

    const modal =
        document.getElementById("deliveryModal");

    const orderId =
        modal.dataset.orderId;


    if (!orderId) {

        alert("Please select a delivery first.");

        return;
    }


    const otp =
        Math.floor(100000 + Math.random() * 900000);


    /* Demo OTP */

    sessionStorage.setItem(
        "deliveryOTP_" + orderId,
        otp
    );


    alert(
        "🔐 DELIVERY OTP\n\n" +
        "OTP: " + otp +
        "\n\nDemo OTP generated successfully."
    );

}


/* ================= MARK DELIVERED ================= */

function markDelivered() {

    const modal =
        document.getElementById("deliveryModal");

    const orderId =
        modal.dataset.orderId;


    if (!orderId) {

        alert("Please select an order.");

        return;
    }


    const delivery =
        deliveryData[orderId];


    if (!delivery) {

        alert("Delivery not found.");

        return;
    }


    if (delivery.status === "Delivered") {

        alert("This order is already delivered.");

        return;
    }


    const confirmation = confirm(
        "Are you sure you want to mark Order #" +
        orderId +
        " as Delivered?"
    );


    if (!confirmation) {

        return;
    }


    /* Update delivery status */

    delivery.status = "Delivered";


    /* Find table row */

    const rows =
        document.querySelectorAll("#deliveryTable tr");


    rows.forEach(row => {

        const orderText =
            row.cells[0]?.textContent.trim();


        if (orderText === "#" + orderId) {

            row.dataset.status = "Delivered";


            const statusElement =
                row.querySelector(".status");


            if (statusElement) {

                statusElement.textContent =
                    "Delivered";

                statusElement.className =
                    "status delivered";

            }

        }

    });


    updateStatistics();


    alert(
        "✅ Order #" +
        orderId +
        " has been marked as Delivered."
    );


    closeModal();

}


/* ================= UPDATE STATISTICS ================= */

function updateStatistics() {

    const rows =
        document.querySelectorAll("#deliveryTable tr");


    let total = 0;
    let pending = 0;
    let outForDelivery = 0;
    let delivered = 0;


    rows.forEach(row => {

        if (row.style.display === "none") {
            return;
        }


        total++;


        const status =
            row.dataset.status;


        if (status === "Pending") {

            pending++;

        }

        else if (status === "Out for Delivery") {

            outForDelivery++;

        }

        else if (status === "Delivered") {

            delivered++;

        }

    });


    document.getElementById("totalDeliveries").textContent =
        total;

    document.getElementById("pendingDeliveries").textContent =
        pending;

    document.getElementById("outDeliveries").textContent =
        outForDelivery;

    document.getElementById("completedDeliveries").textContent =
        delivered;

}


/* ================= CLOSE MODAL OUTSIDE CLICK ================= */

window.addEventListener("click", function (event) {

    const modal =
        document.getElementById("deliveryModal");


    if (event.target === modal) {

        closeModal();

    }

});


/* ================= ESC KEY ================= */

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeModal();

    }

});


/* ================= INITIALIZE ================= */

document.addEventListener("DOMContentLoaded", function () {

    updateStatistics();

});

