
/* =========================================================
   FARMNEST DELIVERY
   DELIVERY HISTORY JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const historyContainer =
        document.getElementById("historyContainer");

    const historyFilter =
        document.getElementById("historyFilter");

    const totalDelivered =
        document.getElementById("totalDelivered");

    const todayDelivered =
        document.getElementById("todayDelivered");

    const totalValue =
        document.getElementById("totalValue");

    const deliveryName =
        document.getElementById("deliveryName");

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
        JSON.parse(
            localStorage.getItem("deliveryUser")
        ) ||
        JSON.parse(
            localStorage.getItem("user")
        );


    if (deliveryUser && deliveryName) {

        deliveryName.textContent =
            deliveryUser.name ||
            deliveryUser.fullName ||
            deliveryUser.username ||
            "Delivery Partner";

    }


    /* =====================================================
       GET ORDERS
    ===================================================== */

    let orders =
        JSON.parse(
            localStorage.getItem("deliveryOrders")
        ) || [];


    /* =====================================================
       GET DELIVERED ORDERS
    ===================================================== */

    function getDeliveredOrders() {

        return orders.filter(order =>
            order.status &&
            order.status.toLowerCase() === "delivered"
        );

    }


    /* =====================================================
       DATE HELPERS
    ===================================================== */

    function getStartOfDay(date) {

        const d = new Date(date);

        d.setHours(0, 0, 0, 0);

        return d;

    }


    function isToday(date) {

        const orderDate =
            getStartOfDay(date);

        const today =
            getStartOfDay(new Date());

        return (
            orderDate.getTime() ===
            today.getTime()
        );

    }


    function isThisWeek(date) {

        const orderDate =
            getStartOfDay(date);

        const today =
            getStartOfDay(new Date());


        const day =
            today.getDay();


        const difference =
            day === 0 ? 6 : day - 1;


        const startOfWeek =
            new Date(today);


        startOfWeek.setDate(
            today.getDate() - difference
        );


        return orderDate >= startOfWeek;

    }


    function isThisMonth(date) {

        const orderDate =
            new Date(date);

        const today =
            new Date();


        return (
            orderDate.getMonth() ===
                today.getMonth() &&

            orderDate.getFullYear() ===
                today.getFullYear()
        );

    }


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDate(date) {

        if (!date) {

            return "Date unavailable";

        }


        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* =====================================================
       UPDATE STATISTICS
    ===================================================== */

    function updateStatistics() {

        const delivered =
            getDeliveredOrders();


        const todayCount =
            delivered.filter(order =>
                isToday(order.date)
            ).length;


        const totalAmount =
            delivered.reduce(
                (total, order) => {

                    return total +
                        Number(order.amount || 0);

                },
                0
            );


        if (totalDelivered) {

            totalDelivered.textContent =
                delivered.length;

        }


        if (todayDelivered) {

            todayDelivered.textContent =
                todayCount;

        }


        if (totalValue) {

            totalValue.textContent =
                "₹" +
                totalAmount.toLocaleString(
                    "en-IN"
                );

        }

    }


    /* =====================================================
       FILTER ORDERS
    ===================================================== */

    function filterOrders(filter) {

        const delivered =
            getDeliveredOrders();


        if (filter === "today") {

            return delivered.filter(
                order =>
                    isToday(order.date)
            );

        }


        if (filter === "week") {

            return delivered.filter(
                order =>
                    isThisWeek(order.date)
            );

        }


        if (filter === "month") {

            return delivered.filter(
                order =>
                    isThisMonth(order.date)
            );

        }


        return delivered;

    }


    /* =====================================================
       LOAD HISTORY
    ===================================================== */

    function loadHistory(
        filter = "all"
    ) {

        if (!historyContainer) {

            return;

        }


        const filteredOrders =
            filterOrders(filter);


        /* NO ORDERS */

        if (
            filteredOrders.length === 0
        ) {

            historyContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        🛵
                    </div>

                    <h3>
                        No Delivery History
                    </h3>

                    <p>
                        No completed deliveries found for this period.
                    </p>

                </div>

            `;

            return;

        }


        /* CLEAR */

        historyContainer.innerHTML = "";


        /* CREATE HISTORY ITEMS */

        filteredOrders
            .slice()
            .reverse()
            .forEach(order => {


                const item =
                    document.createElement("div");


                item.className =
                    "history-item";


                item.innerHTML = `

                    <!-- ORDER ICON -->

                    <div class="history-order-icon">
                        📦
                    </div>


                    <!-- ORDER INFO -->

                    <div class="history-order-info">

                        <strong>
                            Order #${order.id}
                        </strong>

                        <span>
                            ${order.address || "Address unavailable"}
                        </span>

                    </div>


                    <!-- CUSTOMER -->

                    <div class="history-customer">

                        <strong>
                            ${order.customer || "Customer"}
                        </strong>

                        <span>
                            ${order.phone || "Phone unavailable"}
                        </span>

                    </div>


                    <!-- DATE -->

                    <div class="history-date">

                        <strong>
                            ${formatDate(order.date)}
                        </strong>

                        <span>
                            Successfully delivered
                        </span>

                    </div>


                    <!-- AMOUNT -->

                    <div class="history-amount">

                        <strong>
                            ₹${Number(
                                order.amount || 0
                            ).toLocaleString("en-IN")}
                        </strong>

                    </div>


                    <!-- STATUS -->

                    <div>

                        <span class="delivered-badge">
                            ✓ Delivered
                        </span>

                    </div>


                    <!-- VIEW BUTTON -->

                    <div>

                        <button
                            class="history-view-btn"
                            data-id="${order.id}"
                        >
                            View
                        </button>

                    </div>

                `;


                historyContainer.appendChild(
                    item
                );

            });


        attachViewButtons();

    }


    /* =====================================================
       VIEW ORDER
    ===================================================== */

    function attachViewButtons() {

        const buttons =
            document.querySelectorAll(
                ".history-view-btn"
            );


        buttons.forEach(button => {

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

    }


    /* =====================================================
       FILTER CHANGE
    ===================================================== */

    if (historyFilter) {

        historyFilter.addEventListener(
            "change",
            () => {

                loadHistory(
                    historyFilter.value
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
       CLOSE SIDEBAR
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

    updateStatistics();

    loadHistory();

});
