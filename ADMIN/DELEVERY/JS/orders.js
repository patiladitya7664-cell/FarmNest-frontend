/* =========================================================
   FARMNEST DELIVERY
   ASSIGNED ORDERS JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const ordersContainer =
        document.getElementById("ordersContainer");

    const statusFilter =
        document.getElementById("statusFilter");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const menuBtn =
        document.getElementById("menuBtn");

    const sidebar =
        document.querySelector(".delivery-sidebar");

    const deliveryName =
        document.getElementById("deliveryName");


    /* =====================================================
       DELIVERY USER
    ===================================================== */

    const deliveryUser =
        JSON.parse(localStorage.getItem("deliveryUser")) ||
        JSON.parse(localStorage.getItem("user"));

    if (deliveryUser && deliveryName) {

        deliveryName.textContent =
            deliveryUser.name ||
            deliveryUser.fullName ||
            deliveryUser.username ||
            "Delivery Partner";
    }


    /* =====================================================
       GET ORDERS FROM LOCAL STORAGE
    ===================================================== */

    let orders =
        JSON.parse(
            localStorage.getItem("deliveryOrders")
        ) || [];


    /* =====================================================
       SAMPLE ORDERS
       ONLY IF NO ORDERS EXIST
    ===================================================== */

    if (orders.length === 0) {

        orders = [

            {
                id: "FN1001",
                customer: "Rahul Patil",
                phone: "9876543210",
                address: "Shivaji Nagar",
                city: "Ichalkaranji",
                amount: 850,
                payment: "Paid",
                status: "Pending",
                date: new Date().toISOString()
            },

            {
                id: "FN1002",
                customer: "Sneha Kulkarni",
                phone: "9876543211",
                address: "Main Road",
                city: "Ichalkaranji",
                amount: 620,
                payment: "Cash on Delivery",
                status: "Out for Delivery",
                date: new Date().toISOString()
            },

            {
                id: "FN1003",
                customer: "Amit Joshi",
                phone: "9876543212",
                address: "Station Road",
                city: "Ichalkaranji",
                amount: 450,
                payment: "Paid",
                status: "Delivered",
                date: new Date().toISOString()
            }

        ];

        localStorage.setItem(
            "deliveryOrders",
            JSON.stringify(orders)
        );
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

            case "cancelled":
                return "cancelled";

            default:
                return "pending";
        }
    }


    /* =====================================================
       LOAD ORDERS
    ===================================================== */

    function loadOrders(filter = "all") {

        if (!ordersContainer) {
            return;
        }


        let filteredOrders = orders;


        /* FILTER */

        if (filter !== "all") {

            filteredOrders =
                orders.filter(
                    order =>
                        order.status.toLowerCase() ===
                        filter.toLowerCase()
                );
        }


        /* NO ORDERS */

        if (filteredOrders.length === 0) {

            ordersContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        📦
                    </div>

                    <h3>
                        No orders found
                    </h3>

                    <p>
                        There are no orders with this status.
                    </p>

                </div>

            `;

            return;
        }


        /* CLEAR */

        ordersContainer.innerHTML = "";


        /* CREATE ORDER CARDS */

        filteredOrders.forEach(order => {

            const card =
                document.createElement("div");

            card.className =
                "delivery-order-card";


            card.innerHTML = `

                <div class="order-card-top">

                    <div class="order-number">

                        <div class="order-icon">
                            📦
                        </div>

                        <div>

                            <strong>
                                Order #${order.id}
                            </strong>

                            <span>
                                ${formatDate(order.date)}
                            </span>

                        </div>

                    </div>


                    <span class="order-status ${getStatusClass(order.status)}">
                        ${order.status}
                    </span>

                </div>


                <div class="order-card-body">

                    <div class="customer-details">

                        <h3>
                            👤 ${order.customer}
                        </h3>

                        <p>
                            📞 ${order.phone}
                        </p>

                        <p>
                            📍 ${order.address}, ${order.city}
                        </p>

                    </div>


                    <div class="order-payment">

                        <span>
                            Payment
                        </span>

                        <strong>
                            ₹${Number(order.amount).toLocaleString("en-IN")}
                        </strong>

                        <small>
                            ${order.payment}
                        </small>

                    </div>

                </div>


                <div class="order-card-bottom">

                    <button
                        class="details-btn"
                        data-id="${order.id}"
                    >
                        View Details
                    </button>


                    <button
                        class="status-btn"
                        data-id="${order.id}"
                    >
                        Update Status
                    </button>

                </div>

            `;


            ordersContainer.appendChild(card);

        });


        attachOrderButtons();

    }


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDate(date) {

        if (!date) {
            return "Date unavailable";
        }

        const d = new Date(date);

        return d.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    /* =====================================================
       ORDER BUTTONS
    ===================================================== */

    function attachOrderButtons() {

        const detailsButtons =
            document.querySelectorAll(
                ".details-btn"
            );

        const statusButtons =
            document.querySelectorAll(
                ".status-btn"
            );


        /* VIEW DETAILS */

        detailsButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const orderId =
                        button.dataset.id;

                    localStorage.setItem(
                        "selectedDeliveryOrder",
                        orderId
                    );

                    window.location.href =
                        "order-details.html";
                }
            );

        });


        /* UPDATE STATUS */

        statusButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const orderId =
                        button.dataset.id;

                    updateOrderStatus(orderId);

                }
            );

        });

    }


    /* =====================================================
       UPDATE ORDER STATUS
    ===================================================== */

    function updateOrderStatus(orderId) {

        const order =
            orders.find(
                item => item.id === orderId
            );

        if (!order) {
            return;
        }


        let nextStatus;


        switch (
            order.status.toLowerCase()
        ) {

            case "pending":
                nextStatus = "Confirmed";
                break;

            case "confirmed":
                nextStatus = "Processing";
                break;

            case "processing":
                nextStatus = "Out for Delivery";
                break;

            case "shipped":
            case "out for delivery":
                nextStatus = "Delivered";
                break;

            case "delivered":

                alert(
                    "This order has already been delivered."
                );

                return;

            default:
                nextStatus = "Confirmed";
        }


        const confirmUpdate =
            confirm(
                `Update Order #${order.id} to "${nextStatus}"?`
            );


        if (!confirmUpdate) {
            return;
        }


        order.status =
            nextStatus;


        localStorage.setItem(
            "deliveryOrders",
            JSON.stringify(orders)
        );


        loadOrders(
            statusFilter
                ? statusFilter.value
                : "all"
        );

    }


    /* =====================================================
       STATUS FILTER
    ===================================================== */

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            () => {

                loadOrders(
                    statusFilter.value
                );

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
       CLOSE MOBILE SIDEBAR
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

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


                window.location.href =
                    "../login.html";

            }
        );

    }


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadOrders();

});
