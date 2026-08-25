/* =========================================================
   FARMNEST DELIVERY
   DELIVERY ORDERS
   FRONTEND → BACKEND API
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const API_URL = "http://localhost:5000/api/orders";

    const ordersContainer =
        document.getElementById("ordersContainer");

    const deliveryName =
        document.getElementById("deliveryName");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const menuBtn =
        document.getElementById("menuBtn");

    const sidebar =
        document.querySelector(".delivery-sidebar");

    const orderFilter =
        document.getElementById("orderFilter");


    /* =====================================================
       AUTH TOKEN
    ===================================================== */

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("deliveryToken");


    /* =====================================================
       USER
    ===================================================== */

    const user =
        JSON.parse(
            localStorage.getItem("user")
        ) ||
        JSON.parse(
            localStorage.getItem("deliveryUser")
        );


    if (user && deliveryName) {

        deliveryName.textContent =
            user.name ||
            user.fullName ||
            user.username ||
            "Delivery Partner";

    }


    /* =====================================================
       TOKEN CHECK
    ===================================================== */

    if (!token) {

        alert(
            "Please login first."
        );

        window.location.href =
            "../login.html";

        return;

    }


    /* =====================================================
       LOAD ORDERS
    ===================================================== */

    async function loadOrders() {

        try {

            if (ordersContainer) {

                ordersContainer.innerHTML = `

                    <div class="orders-loading">

                        🚚 Loading assigned orders...

                    </div>

                `;

            }


            /*
               Backend endpoint:
               GET /api/orders
            */

            const response =
                await fetch(
                    API_URL,
                    {
                        method: "GET",

                        headers: {

                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"

                        }

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load orders"
                );

            }


            console.log(
                "Delivery Orders:",
                data
            );


            /*
               Backend may return:
               data.orders
               OR directly an array
            */

            const orders =
                Array.isArray(data)
                    ? data
                    : data.orders || [];


            /*
               Save orders temporarily
               for other delivery pages.
            */

            localStorage.setItem(
                "deliveryOrders",
                JSON.stringify(orders)
            );


            displayOrders(
                orders
            );


        } catch (error) {

            console.error(
                "Delivery Orders Error:",
                error
            );


            if (ordersContainer) {

                ordersContainer.innerHTML = `

                    <div class="empty-state">

                        <div class="empty-icon">
                            ⚠️
                        </div>

                        <h3>
                            Unable to Load Orders
                        </h3>

                        <p>
                            ${error.message}
                        </p>

                        <br>

                        <button
                            class="status-btn"
                            id="retryOrders"
                        >
                            Try Again
                        </button>

                    </div>

                `;


                const retry =
                    document.getElementById(
                        "retryOrders"
                    );


                if (retry) {

                    retry.addEventListener(
                        "click",
                        loadOrders
                    );

                }

            }

        }

    }


    /* =====================================================
       DISPLAY ORDERS
    ===================================================== */

    function displayOrders(
        orders
    ) {

        if (!ordersContainer) {

            return;

        }


        if (!orders.length) {

            ordersContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        📦
                    </div>

                    <h3>
                        No Assigned Orders
                    </h3>

                    <p>
                        You currently have no orders assigned for delivery.
                    </p>

                </div>

            `;

            return;

        }


        ordersContainer.innerHTML = "";


        orders.forEach(
            order => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "delivery-order-card";


                const orderId =
                    order._id ||
                    order.id ||
                    "N/A";


                const status =
                    order.status ||
                    "Pending";


                const customerName =
                    order.customerName ||
                    order.customer?.name ||
                    order.customer ||
                    "Customer";


                const phone =
                    order.phone ||
                    order.customer?.phone ||
                    "Not available";


                const address =
                    order.deliveryAddress ||
                    order.address ||
                    order.shippingAddress ||
                    "Address not available";


                const amount =
                    Number(
                        order.totalAmount ||
                        order.total ||
                        order.amount ||
                        0
                    );


                card.innerHTML = `

                    <div class="order-card-top">

                        <div class="order-number">

                            <div class="order-icon">
                                📦
                            </div>

                            <div>

                                <strong>
                                    Order #${orderId}
                                </strong>

                                <span>
                                    ${formatDate(
                                        order.createdAt ||
                                        order.date
                                    )}
                                </span>

                            </div>

                        </div>


                        <span
                            class="order-status ${getStatusClass(status)}"
                        >
                            ${status}
                        </span>

                    </div>


                    <div class="order-card-body">


                        <div class="customer-details">

                            <h3>
                                👤 Customer Details
                            </h3>

                            <p>
                                <strong>
                                    Customer:
                                </strong>
                                ${customerName}
                            </p>

                            <p>
                                <strong>
                                    Phone:
                                </strong>
                                ${phone}
                            </p>

                            <p>
                                <strong>
                                    Address:
                                </strong>
                                ${address}
                            </p>

                        </div>


                        <div class="order-payment">

                            <span>
                                ORDER VALUE
                            </span>

                            <strong>
                                ₹${amount.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>

                            <small>
                                ${order.paymentStatus ||
                                order.payment ||
                                "Payment Pending"}
                            </small>

                        </div>


                    </div>


                    <div class="order-card-bottom">

                        <button
                            class="details-btn"
                            data-id="${orderId}"
                        >
                            View Details
                        </button>


                        ${
                            status.toLowerCase() !==
                            "delivered"
                            ?
                            `
                                <button
                                    class="status-btn update-order-btn"
                                    data-id="${orderId}"
                                >
                                    Update Status
                                </button>
                            `
                            :
                            ""
                        }

                    </div>

                `;


                ordersContainer.appendChild(
                    card
                );

            }
        );


        attachButtons(
            orders
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
       DATE FORMAT
    ===================================================== */

    function formatDate(
        date
    ) {

        if (!date) {

            return "Date unavailable";

        }


        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* =====================================================
       BUTTONS
    ===================================================== */

    function attachButtons(
        orders
    ) {

        /*
           VIEW DETAILS
        */

        document
            .querySelectorAll(
                ".details-btn"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const orderId =
                                button.dataset.id;


                            const order =
                                orders.find(
                                    item =>
                                        (
                                            item._id ||
                                            item.id
                                        ) ==
                                        orderId
                                );


                            if (order) {

                                localStorage.setItem(
                                    "selectedDeliveryOrder",
                                    JSON.stringify(
                                        order
                                    )
                                );

                            }


                            window.location.href =
                                "order-details.html";

                        }
                    );

                }
            );


        /*
           UPDATE STATUS
        */

        document
            .querySelectorAll(
                ".update-order-btn"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const orderId =
                                button.dataset.id;


                            updateOrderStatus(
                                orderId
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       UPDATE ORDER STATUS
    ===================================================== */

    async function updateOrderStatus(
        orderId
    ) {

        const newStatus =
            prompt(
                "Enter new status:\n\n" +
                "Confirmed\n" +
                "Processing\n" +
                "Shipped\n" +
                "Delivered"
            );


        if (!newStatus) {

            return;

        }


        const allowedStatuses = [
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered"
        ];


        if (
            !allowedStatuses.includes(
                newStatus
            )
        ) {

            alert(
                "Invalid status.\nPlease use: Confirmed, Processing, Shipped or Delivered."
            );

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/${orderId}/status`,
                    {
                        method: "PUT",

                        headers: {

                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            status:
                                newStatus

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to update order"
                );

            }


            alert(
                "Order status updated successfully! ✅"
            );


            loadOrders();


        } catch (error) {

            console.error(
                "Status Update Error:",
                error
            );


            alert(
                error.message
            );

        }

    }


    /* =====================================================
       FILTER
    ===================================================== */

    if (orderFilter) {

        orderFilter.addEventListener(
            "change",
            async () => {

                const value =
                    orderFilter.value;


                const savedOrders =
                    JSON.parse(
                        localStorage.getItem(
                            "deliveryOrders"
                        )
                    ) || [];


                let filtered =
                    savedOrders;


                if (
                    value &&
                    value !== "all"
                ) {

                    filtered =
                        savedOrders.filter(
                            order =>

                                String(
                                    order.status
                                ).toLowerCase() ===
                                value.toLowerCase()
                        );

                }


                displayOrders(
                    filtered
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

    loadOrders();

});
