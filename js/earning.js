javascript
/* =========================================
   FARMNEST - EARNING JAVASCRIPT
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       EARNINGS CHART
       ========================================= */

    const chartCanvas = document.getElementById("earningChart");
    const periodSelect = document.getElementById("earningPeriod");

    let earningChart;


    const chartData = {

        monthly: {
            labels: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul"
            ],

            data: [
                28000,
                35000,
                42000,
                39000,
                51000,
                46000,
                48750
            ]
        },

        weekly: {
            labels: [
                "Week 1",
                "Week 2",
                "Week 3",
                "Week 4"
            ],

            data: [
                9500,
                12500,
                10800,
                15950
            ]
        },

        yearly: {
            labels: [
                "2022",
                "2023",
                "2024",
                "2025",
                "2026"
            ],

            data: [
                185000,
                240000,
                265000,
                312000,
                284500
            ]
        }

    };


    function createChart(period = "monthly") {

        if (!chartCanvas) return;

        if (earningChart) {
            earningChart.destroy();
        }

        const selectedData = chartData[period];

        earningChart = new Chart(chartCanvas, {

            type: "line",

            data: {

                labels: selectedData.labels,

                datasets: [

                    {
                        label: "Earnings (₹)",

                        data: selectedData.data,

                        borderWidth: 3,

                        tension: 0.4,

                        fill: true,

                        pointRadius: 4,

                        pointHoverRadius: 7
                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: true
                    },

                    tooltip: {

                        callbacks: {

                            label: function (context) {

                                return " ₹" +
                                    context.raw.toLocaleString("en-IN");

                            }

                        }

                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback: function (value) {

                                return "₹" +
                                    Number(value).toLocaleString("en-IN");

                            }

                        }

                    }

                }

            }

        });

    }


    /* Initial Chart */

    createChart("monthly");


    /* Change Chart Period */

    if (periodSelect) {

        periodSelect.addEventListener("change", function () {

            createChart(this.value);

        });

    }


    /* =========================================
       TRANSACTION FILTER
       ========================================= */

    const filterButton =
        document.getElementById("filterTransactions");

    const transactionTable =
        document.getElementById("transactionsTable");


    if (filterButton && transactionTable) {

        filterButton.addEventListener("click", function () {

            const rows =
                transactionTable.querySelectorAll("tbody tr");

            let showOnlyPending =
                filterButton.dataset.filter === "pending";


            rows.forEach(function (row) {

                const status =
                    row.querySelector(".payment-status");

                if (!status) return;

                const isPending =
                    status.classList.contains("pending");


                if (showOnlyPending) {

                    row.style.display = "";

                } else {

                    row.style.display =
                        isPending ? "" : "none";

                }

            });


            if (showOnlyPending) {

                filterButton.dataset.filter = "";

                filterButton.innerHTML =
                    '<i class="fas fa-filter"></i> Filter';

                rows.forEach(function (row) {
                    row.style.display = "";
                });

            } else {

                filterButton.dataset.filter = "pending";

                filterButton.innerHTML =
                    '<i class="fas fa-clock"></i> Pending Only';

            }

        });

    }


    /* =========================================
       DOWNLOAD REPORT
       ========================================= */

    const downloadButton =
        document.getElementById("downloadReport");


    if (downloadButton) {

        downloadButton.addEventListener("click", function () {

            const reportData = [

                ["FarmNest Earnings Report"],
                ["Generated On", new Date().toLocaleDateString("en-IN")],
                [],
                ["Summary"],
                ["Total Earnings", "₹2,84,500"],
                ["This Month", "₹48,750"],
                ["Pending Payment", "₹12,800"],
                ["Completed Payments", "₹2,71,700"],
                [],
                ["Recent Transactions"],
                [
                    "Transaction ID",
                    "Order ID",
                    "Customer",
                    "Product",
                    "Amount",
                    "Date",
                    "Status"
                ],

                [
                    "#TXN1001",
                    "#FN1001",
                    "Rahul Sharma",
                    "Organic Rice",
                    "₹4,500",
                    "30 Jul 2026",
                    "Paid"
                ],

                [
                    "#TXN1002",
                    "#FN1002",
                    "Priya Patil",
                    "Tur Dal",
                    "₹3,800",
                    "29 Jul 2026",
                    "Paid"
                ],

                [
                    "#TXN1003",
                    "#FN1003",
                    "Amit Deshmukh",
                    "Organic Wheat",
                    "₹5,200",
                    "28 Jul 2026",
                    "Pending"
                ],

                [
                    "#TXN1004",
                    "#FN1004",
                    "Sneha Joshi",
                    "Fresh Vegetables",
                    "₹2,750",
                    "27 Jul 2026",
                    "Paid"
                ],

                [
                    "#TXN1005",
                    "#FN1005",
                    "Vikas Patil",
                    "Fresh Onions",
                    "₹3,450",
                    "26 Jul 2026",
                    "Pending"
                ]

            ];


            const csvContent = reportData
                .map(row =>
                    row.map(value =>
                        `"${String(value).replace(/"/g, '""')}"`
                    ).join(",")
                )
                .join("\n");


            const blob = new Blob(
                [csvContent],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                "FarmNest-Earnings-Report.csv";

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            URL.revokeObjectURL(url);


            alert(
                "Earnings report downloaded successfully! 📊"
            );

        });

    }


    /* =========================================
       NUMBER FORMATTER
       ========================================= */

    function formatCurrency(amount) {

        return "₹" +
            Number(amount).toLocaleString("en-IN");

    }


    /* =========================================
       PAYMENT STATUS CLICK
       ========================================= */

    const paymentStatuses =
        document.querySelectorAll(".payment-status");


    paymentStatuses.forEach(function (status) {

        status.addEventListener("click", function () {

            const statusText =
                this.textContent.trim();

            alert(
                "Payment Status: " +
                statusText
            );

        });

    });


    /* =========================================
       PANEL HOVER EFFECT
       ========================================= */

    const cards =
        document.querySelectorAll(".earning-card");

    cards.forEach(function (card) {

        card.addEventListener("mouseenter", function () {

            this.style.transform =
                "translateY(-4px)";

        });


        card.addEventListener("mouseleave", function () {

            this.style.transform =
                "translateY(0)";

        });

    });


    /* =========================================
       CONSOLE MESSAGE
       ========================================= */

    console.log(
        "FarmNest Earnings Panel Loaded Successfully."
    );

});
