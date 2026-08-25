/* =========================================================
   FARMNEST DELIVERY
   DELIVERY EARNING JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const totalEarnings =
        document.getElementById("totalEarnings");

    const todayEarnings =
        document.getElementById("todayEarnings");

    const weekEarnings =
        document.getElementById("weekEarnings");

    const monthEarnings =
        document.getElementById("monthEarnings");

    const deliveredOrders =
        document.getElementById("deliveredOrders");

    const earningContainer =
        document.getElementById("earningContainer");

    const earningFilter =
        document.getElementById("earningFilter");

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

    function getOrders() {

        return JSON.parse(
            localStorage.getItem("deliveryOrders")
        ) || [];

    }


    /* =====================================================
       GET DELIVERED ORDERS
    ===================================================== */

    function getDeliveredOrders() {

        return getOrders().filter(order => {

            return (
                String(
                    order.status || ""
                ).toLowerCase() ===
                "delivered"
            );

        });

    }


    /* =====================================================
       GET ORDER DATE
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
       GET EARNING AMOUNT
    ===================================================== */

    function getEarningAmount(order) {

        /*
           Delivery earning can come from:
           deliveryEarning
           deliveryFee
           earning
           deliveryCharge

           If none exists, use delivery
           charge of ₹40 as temporary
           frontend fallback.
        */

        const amount =
            order.deliveryEarning ??
            order.deliveryFee ??
            order.earning ??
            order.deliveryCharge;


        if (
            amount !== undefined &&
            amount !== null &&
            !isNaN(Number(amount))
        ) {

            return Number(amount);

        }


        return 40;

    }


    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    function formatMoney(amount) {

        return "₹" +
            Number(amount || 0)
                .toLocaleString("en-IN");

    }


    /* =====================================================
       DATE HELPERS
    ===================================================== */

    function startOfDay(date) {

        const d =
            new Date(date);

        d.setHours(
            0,
            0,
            0,
            0
        );

        return d;

    }


    function isToday(date) {

        return (
            startOfDay(date).getTime() ===
            startOfDay(new Date()).getTime()
        );

    }


    function isThisWeek(date) {

        const currentDate =
            startOfDay(new Date());

        const orderDate =
            startOfDay(date);


        const day =
            currentDate.getDay();


        const difference =
            day === 0
                ? 6
                : day - 1;


        const startWeek =
            new Date(currentDate);


        startWeek.setDate(
            currentDate.getDate() -
            difference
        );


        return orderDate >= startWeek;

    }


    function isThisMonth(date) {

        const orderDate =
            new Date(date);

        const currentDate =
            new Date();


        return (
            orderDate.getMonth() ===
                currentDate.getMonth() &&

            orderDate.getFullYear() ===
                currentDate.getFullYear()
        );

    }


    /* =====================================================
       CALCULATE TOTAL
    ===================================================== */

    function calculateEarnings(
        orders
    ) {

        return orders.reduce(
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

    }


    /* =====================================================
       UPDATE STATISTICS
    ===================================================== */

    function updateStatistics() {

        const delivered =
            getDeliveredOrders();


        const today =
            delivered.filter(
                order =>
                    isToday(
                        getOrderDate(order)
                    )
            );


        const week =
            delivered.filter(
                order =>
                    isThisWeek(
                        getOrderDate(order)
                    )
            );


        const month =
            delivered.filter(
                order =>
                    isThisMonth(
                        getOrderDate(order)
                    )
            );


        const total =
            calculateEarnings(
                delivered
            );


        const todayTotal =
            calculateEarnings(
                today
            );


        const weekTotal =
            calculateEarnings(
                week
            );


        const monthTotal =
            calculateEarnings(
                month
            );


        if (totalEarnings) {

            totalEarnings.textContent =
                formatMoney(total);

        }


        if (todayEarnings) {

            todayEarnings.textContent =
                formatMoney(todayTotal);

        }


        if (weekEarnings) {

            weekEarnings.textContent =
                formatMoney(weekTotal);

        }


        if (monthEarnings) {

            monthEarnings.textContent =
                formatMoney(monthTotal);

        }


        if (deliveredOrders) {

            deliveredOrders.textContent =
                delivered.length;

        }

    }


    /* =====================================================
       FILTER ORDERS
    ===================================================== */

    function filterOrders(
        filter
    ) {

        const delivered =
            getDeliveredOrders();


        if (filter === "today") {

            return delivered.filter(
                order =>
                    isToday(
                        getOrderDate(order)
                    )
            );

        }


        if (filter === "week") {

            return delivered.filter(
                order =>
                    isThisWeek(
                        getOrderDate(order)
                    )
            );

        }


        if (filter === "month") {

            return delivered.filter(
                order =>
                    isThisMonth(
                        getOrderDate(order)
                    )
            );

        }


        return delivered;

    }


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDate(date) {

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
       DISPLAY EARNINGS
    ===================================================== */

    function displayEarnings(
        filter = "all"
    ) {

        if (!earningContainer) {

            return;

        }


        const orders =
            filterOrders(filter);


        /* EMPTY */

        if (orders.length === 0) {

            earningContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        💰
                    </div>

                    <h3>
                        No Earnings Found
                    </h3>

                    <p>
                        No completed deliveries found for this period.
                    </p>

                </div>

            `;

            return;

        }


        earningContainer.innerHTML = "";


        /*
           Latest delivery first
        */

        orders
            .slice()
            .reverse()
            .forEach(order => {

                const orderId =
                    order._id ||
                    order.id ||
                    "N/A";


                const orderDate =
                    getOrderDate(order);


                const orderAmount =
                    Number(
                        order.totalAmount ||
                        order.total ||
                        order.amount ||
                        0
                    );


                const earning =
                    getEarningAmount(
                        order
                    );


                const customer =
                    order.customerName ||
                    order.customer?.name ||
                    order.customer ||
                    "Customer";


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "earning-row";


                row.innerHTML = `

                    <!-- ORDER ICON -->

                    <div class="earning-order-icon">
                        📦
                    </div>


                    <!-- ORDER INFO -->

                    <div class="earning-order-info">

                        <strong>
                            Order #${orderId}
                        </strong>

                        <span>
                            ${customer}
                        </span>

                    </div>


                    <!-- DATE -->

                    <div class="earning-date">

                        <strong>
                            ${formatDate(orderDate)}
                        </strong>

                        <span>
                            Delivery completed
                        </span>

                    </div>


                    <!-- ORDER VALUE -->

                    <div class="earning-order-value">

                        <strong>
                            ${formatMoney(orderAmount)}
                        </strong>

                        <span>
                            Order Value
                        </span>

                    </div>


                    <!-- EARNING -->

                    <div class="earning-amount">

                        <strong>
                            +${formatMoney(earning)}
                        </strong>

                        <span>
                            Delivery Earning
                        </span>

                    </div>


                    <!-- BADGE -->

                    <div>

                        <span class="earned-badge">
                            ✓ Earned
                        </span>

                    </div>

                `;


                earningContainer.appendChild(
                    row
                );

            });

    }


    /* =====================================================
       FILTER CHANGE
    ===================================================== */

    if (earningFilter) {

        earningFilter.addEventListener(
            "change",
            () => {

                displayEarnings(
                    earningFilter.value
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

                if (
                    !confirm(
                        "Are you sure you want to logout?"
                    )
                ) {

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

    updateStatistics();

    displayEarnings();

});