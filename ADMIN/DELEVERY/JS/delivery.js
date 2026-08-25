/* =========================================================
   FARMNEST DELIVERY
   DELIVERY DASHBOARD JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const assignedOrders =
        document.getElementById("assignedOrders");

    const completedOrders =
        document.getElementById("completedOrders");

    const pendingOrders =
        document.getElementById("pendingOrders");

    const todayEarnings =
        document.getElementById("todayEarnings");

    const recentOrders =
        document.getElementById("recentOrders");

    const deliveryName =
        document.getElementById("deliveryName");

    const headerAvatar =
        document.getElementById("headerAvatar");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const menuBtn =
        document.getElementById("menuBtn");

    const sidebar =
        document.querySelector(".delivery-sidebar");


    /* =====================================================
       LOAD DELIVERY USER
    ===================================================== */

    const deliveryUser =
        JSON.parse(
            localStorage.getItem("deliveryUser")
        ) ||
        JSON.parse(
            localStorage.getItem("user")
        );


    if (deliveryUser) {

        const name =
            deliveryUser.name ||
            deliveryUser.fullName ||
            deliveryUser.username ||
            "Delivery Partner";


        if (deliveryName) {

            deliveryName.textContent =
                name;

        }


        if (headerAvatar) {

            headerAvatar.textContent =
                name
                    .trim()
                    .charAt(0)
                    .toUpperCase();

        }

    }


    /* =====================================================
       GET ORDERS
    ===================================================== */

    function getOrders() {

        return JSON.parse(
            localStorage.getItem("deliveryOrders")
        ) || [];

    }


    /* =====================================================
       STATUS NORMALIZER
    ===================================================== */

    function getStatus(order) {

        return String(
            order.status || "Pending"
        ).toLowerCase();

    }


    /* =====================================================
       DELIVERY ORDERS
    ===================================================== */

    function calculateStats() {

        const orders =
            getOrders();


        const delivered =
            orders.filter(order =>
                getStatus(order) ===
                "delivered"
            );


        const pending =
            orders.filter(order => {

                const status =
                    getStatus(order);

                return (
                    status !== "delivered" &&
                    status !== "cancelled" &&
                    status !== "canceled"
                );

            });


        if (assignedOrders) {

            assignedOrders.textContent =
                orders.length;

        }


        if (completedOrders) {

            completedOrders.textContent =
                delivered.length;

        }


        if (pendingOrders) {

            pendingOrders.textContent =
                pending.length;

        }


        calculateTodayEarnings(
            delivered
        );

    }


    /* =====================================================
       DATE HELPER
    ===================================================== */

    function getOrderDate(order) {

        return new Date(
            order.deliveredAt ||
            order.updatedAt ||
            order.createdAt ||
            order.date ||
            Date.now()
        );

    }


    /* =====================================================
       TODAY CHECK
    ===================================================== */

    function isToday(date) {

        const today =
            new Date();

        const orderDate =
            new Date(date);


        return (
            today.getDate() ===
            orderDate.getDate() &&

            today.getMonth() ===
            orderDate.getMonth() &&

            today.getFullYear() ===
            orderDate.getFullYear()
        );

    }


    /* =====================================================
       EARNING AMOUNT
    ===================================================== */

    function getEarningAmount(order) {

        const earning =
            order.deliveryEarning ??
            order.deliveryFee ??
            order.earning ??
            order.deliveryCharge;


        if (
            earning !== undefined &&
            earning !== null &&
            !isNaN(Number(earning))
        ) {

            return Number(earning);

        }


        /*
           Temporary fallback.
           Backend earning field aane ke baad
           actual amount automatically use hoga.
        */

        return 40;

    }


    /* =====================================================
       TODAY EARNINGS
    ===================================================== */

    function calculateTodayEarnings(
        deliveredOrders
    ) {

        const todayOrders =
            deliveredOrders.filter(
                order =>
                    isToday(
                        getOrderDate(order)
                    )
            );


        const earnings =
            todayOrders.reduce(
                (
                    total,
                    order
                ) => {

                    return total +
                        getEarningAmount(
                            order
                        );

                },
                0
            );


        if (todayEarnings) {

            todayEarnings.textContent =
                "₹" +
                earnings.toLocaleString(
                    "en-IN"
                );

        }

    }


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDate(date) {

        if (!date) {

            return "Date unavailable";

        }


        return new Date(date)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

    }


    /* =====================================================
       STATUS CLASS
    ===================================================== */

    function getStatusClass(
        status
    ) {

        return String(status)
            .toLowerCase()
            .replace(/\s+/g, "-");

    }


    /* =====================================================
       DISPLAY RECENT ORDERS
    ===================================================== */

    function displayRecentOrders() {

        if (!recentOrders) {

            return;

        }


        const orders =
            getOrders();


        if (!orders.length) {

            recentOrders.innerHTML = `

                <div class="dashboard-loading">

                    📦

                    <br><br>

                    No assigned orders yet.

                </div>

            `;

            return;

        }


        /*
           Latest orders first
        */

        const latestOrders =
            orders
                .slice()
                .reverse()
                .slice(0, 5);


        recentOrders.innerHTML = "";


        latestOrders.forEach(
            order => {

                const orderId =
                    order._id ||
                    order.id ||
                    "N/A";


                const status =
                    order.status ||
                    "Pending";


                const customer =
                    order.customerName ||
                    order.customer?.name ||
                    order.customer ||
                    "Customer";


                const orderElement =
                    document.createElement(
                        "div"
                    );


                orderElement.className =
                    "recent-order";


                orderElement.innerHTML = `

                    <div class="recent-order-icon">
                        📦
                    </div>


                    <div class="recent-order-info">

                        <strong>
                            Order #${orderId}
                        </strong>

                        <span>
                            ${customer}
                            •
                            ${formatDate(
                                order.createdAt ||
                                order.date
                            )}
                        </span>

                    </div>


                    <span
                        class="
                            recent-order-status
                            ${getStatusClass(status)}
                        "
                    >
                        ${status}
                    </span>

                `;


                recentOrders.appendChild(
                    orderElement
                );

            }
        );

    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    if (
        menuBtn &&
        sidebar
    ) {

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
                menuBtn &&
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
                    "token"
                );

                localStorage.removeItem(
                    "deliveryToken"
                );

                localStorage.removeItem(
                    "user"
                );

                localStorage.removeItem(
                    "deliveryUser"
                );


                window.location.href =
                    "../login.html";

            }
        );

    }


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    calculateStats();

    displayRecentOrders();


    /* =====================================================
       AUTO REFRESH
    ===================================================== */

    setInterval(
        () => {

            calculateStats();

            displayRecentOrders();

        },
        30000
    );

});