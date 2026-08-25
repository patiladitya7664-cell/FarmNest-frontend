/* =========================================================
   FARMNEST DELIVERY DASHBOARD
   DELIVERY DASHBOARD JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const totalOrders = document.getElementById("totalOrders");
    const pendingOrders = document.getElementById("pendingOrders");
    const outForDelivery = document.getElementById("outForDelivery");
    const deliveredOrders = document.getElementById("deliveredOrders");

    const deliveryName = document.getElementById("deliveryName");
    const welcomeName = document.getElementById("welcomeName");

    const todayDeliveryList =
        document.getElementById("todayDeliveryList");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const menuBtn =
        document.getElementById("menuBtn");

    const sidebar =
        document.querySelector(".delivery-sidebar");


    /* =====================================================
       DELIVERY USER
    ===================================================== */

    const deliveryUser =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("deliveryUser"));

    if (deliveryUser) {

        const name =
            deliveryUser.name ||
            deliveryUser.fullName ||
            deliveryUser.username ||
            "Delivery Partner";

        if (deliveryName) {
            deliveryName.textContent = name;
        }

        if (welcomeName) {
            welcomeName.textContent = name;
        }
    }


    /* =====================================================
       SAMPLE ORDERS
       TEMPORARY DATA
       BACKEND WILL REPLACE THIS LATER
    ===================================================== */

    let orders =
        JSON.parse(localStorage.getItem("deliveryOrders")) || [

            {
                id: "FN1001",
                customer: "Rahul Patil",
                address: "Shivaji Nagar",
                amount: 850,
                status: "Pending",
                date: new Date().toISOString()
            },

            {
                id: "FN1002",
                customer: "Sneha Kulkarni",
                address: "Main Road",
                amount: 620,
                status: "Out for Delivery",
                date: new Date().toISOString()
            },

            {
                id: "FN1003",
                customer: "Amit Joshi",
                address: "Station Road",
                amount: 450,
                status: "Delivered",
                date: new Date().toISOString()
            }

        ];


    /* =====================================================
       SAVE ORDERS
    ===================================================== */

    localStorage.setItem(
        "deliveryOrders",
        JSON.stringify(orders)
    );


    /* =====================================================
       UPDATE STATISTICS
    ===================================================== */

    function updateStatistics() {

        const total = orders.length;

        const pending =
            orders.filter(
                order =>
                    order.status.toLowerCase() === "pending"
            ).length;

        const out =
            orders.filter(
                order =>
                    order.status.toLowerCase() ===
                    "out for delivery"
            ).length;

        const delivered =
            orders.filter(
                order =>
                    order.status.toLowerCase() ===
                    "delivered"
            ).length;


        if (totalOrders) {
            totalOrders.textContent = total;
        }

        if (pendingOrders) {
            pendingOrders.textContent = pending;
        }

        if (outForDelivery) {
            outForDelivery.textContent = out;
        }

        if (deliveredOrders) {
            deliveredOrders.textContent = delivered;
        }
    }


    /* =====================================================
       STATUS CLASS
    ===================================================== */

    function getStatusClass(status) {

        switch (status.toLowerCase()) {

            case "pending":
                return "pending";

            case "confirmed":
                return "confirmed";

            case "processing":
                return "processing";

            case "shipped":
                return "shipped";

            case "out for delivery":
                return "shipped";

            case "delivered":
                return "delivered";

            default:
                return "pending";
        }
    }


    /* =====================================================
       LOAD TODAY'S DELIVERIES
    ===================================================== */

    function loadTodayDeliveries() {

        if (!todayDeliveryList) {
            return;
        }


        if (orders.length === 0) {

            todayDeliveryList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        📦
                    </div>

                    <h3>No deliveries yet</h3>

                    <p>
                        Your assigned deliveries will appear here.
                    </p>

                </div>
            `;

            return;
        }


        todayDeliveryList.innerHTML = "";


        orders.slice(0, 5).forEach(order => {

            const item =
                document.createElement("div");

            item.className =
                "delivery-item";


            item.innerHTML = `

                <div class="order-icon">
                    📦
                </div>

                <div class="order-info">

                    <strong>
                        Order #${order.id}
                    </strong>

                    <span>
                        ${order.customer} • ${order.address}
                    </span>

                </div>

                <span class="order-status ${getStatusClass(order.status)}">
                    ${order.status}
                </span>

            `;


            todayDeliveryList.appendChild(item);

        });

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                const confirmLogout =
                    confirm(
                        "Are you sure you want to logout?"
                    );

                if (!confirmLogout) {
                    return;
                }


                localStorage.removeItem(
                    "deliveryUser"
                );

                localStorage.removeItem(
                    "deliveryToken"
                );


                /*
                   Change this path later
                   according to your login page.
                */

                window.location.href =
                    "../login.html";

            }
        );

    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    if (menuBtn && sidebar) {

        menuBtn.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "show"
                );

            }
        );

    }


    /* =====================================================
       CLOSE SIDEBAR ON OUTSIDE CLICK
    ===================================================== */

    document.addEventListener(
        "click",
        (event) => {

            if (
                window.innerWidth <= 768 &&
                sidebar &&
                sidebar.classList.contains("show") &&
                !sidebar.contains(event.target) &&
                !menuBtn.contains(event.target)
            ) {

                sidebar.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    updateStatistics();

    loadTodayDeliveries();

});
