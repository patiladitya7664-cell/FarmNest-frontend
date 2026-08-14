/* ==========================================
   FARMNEST ANALYTICS PAGE JAVASCRIPT
   File : analytics.js
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       Counter Animation
    ========================== */

    document.querySelectorAll(".count").forEach(counter => {

        const target = +counter.dataset.target;
        let value = 0;

        const update = () => {

            const increment = Math.ceil(target / 80);

            if (value < target) {

                value += increment;

                if (value > target) value = target;

                counter.innerText = value.toLocaleString();

                requestAnimationFrame(update);

            }

        };

        update();

    });

    /* =========================
       Revenue Chart
    ========================== */

    const revenueCanvas = document.getElementById("revenueChart");

    if (revenueCanvas) {

        new Chart(revenueCanvas, {

            type: "line",

            data: {

                labels: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul"
                ],

                datasets: [{

                    label: "Revenue",

                    data: [
                        12000,
                        18000,
                        15000,
                        22000,
                        26000,
                        24000,
                        30000
                    ],

                    borderColor: "#2E7D32",

                    backgroundColor: "rgba(46,125,50,.15)",

                    fill: true,

                    tension: .4

                }]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {

                        display: true

                    }

                }

            }

        });

    }

    /* =========================
       Orders Chart
    ========================== */

    const orderCanvas = document.getElementById("ordersChart");

    if (orderCanvas) {

        new Chart(orderCanvas, {

            type: "bar",

            data: {

                labels: [
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                    "Sun"
                ],

                datasets: [{

                    label: "Orders",

                    data: [
                        24,
                        35,
                        28,
                        42,
                        38,
                        50,
                        44
                    ],

                    backgroundColor: "#4CAF50"

                }]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        });

    }

    /* =========================
       Product Distribution
    ========================== */

    const productCanvas = document.getElementById("productChart");

    if (productCanvas) {

        new Chart(productCanvas, {

            type: "doughnut",

            data: {

                labels: [
                    "Vegetables",
                    "Fruits",
                    "Grains",
                    "Dairy",
                    "Others"
                ],

                datasets: [{

                    data: [
                        35,
                        25,
                        18,
                        12,
                        10
                    ],

                    backgroundColor: [
                        "#2E7D32",
                        "#43A047",
                        "#66BB6A",
                        "#81C784",
                        "#A5D6A7"
                    ]

                }]

            },

            options: {

                responsive: true

            }

        });

    }

    /* =========================
       Export Report
    ========================== */

    const exportBtn = document.getElementById("exportReport");

    if (exportBtn) {

        exportBtn.addEventListener("click", () => {

            alert("Analytics Report Downloaded Successfully.");

        });

    }

    /* =========================
       Refresh Data
    ========================== */

    const refreshBtn = document.getElementById("refreshAnalytics");

    if (refreshBtn) {

        refreshBtn.addEventListener("click", () => {

            location.reload();

        });

    }

    /* =========================
       Search Table
    ========================== */

    const search = document.getElementById("searchAnalytics");

    if (search) {

        search.addEventListener("keyup", () => {

            const value = search.value.toLowerCase();

            document.querySelectorAll("tbody tr").forEach(row => {

                row.style.display =
                    row.innerText.toLowerCase().includes(value)
                        ? ""
                        : "none";

            });

        });

    }

    /* =========================
       Filter Dropdown
    ========================== */

    const filter = document.getElementById("analyticsFilter");

    if (filter) {

        filter.addEventListener("change", () => {

            console.log("Filter :", filter.value);

        });

    }

});