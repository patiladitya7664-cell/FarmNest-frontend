/* =========================================================
   FARMNEST FARMER REPORTS
   report.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       REPORT BUTTONS
    ===================================================== */

    const reportButtons =
        document.querySelectorAll(".report-card button");


    reportButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const reportCard =
                button.closest(".report-card");


            const reportTitle =
                reportCard.querySelector("h2").textContent.trim();


            openReport(reportTitle);

        });

    });


    /* =====================================================
       INITIALIZE REPORT PAGE
    ===================================================== */

    console.log("FarmNest Reports Loaded Successfully 🌱");

});



/* =========================================================
   OPEN REPORT
   ========================================================= */

function openReport(reportName) {

    console.log("Opening:", reportName);


    switch (reportName) {

        case "Sales Report":

            showReportMessage(
                "Sales Report",
                "Sales report will be displayed here."
            );

            break;


        case "Product Report":

            showReportMessage(
                "Product Report",
                "Product and inventory report will be displayed here."
            );

            break;


        case "Storage Report":

            showReportMessage(
                "Storage Report",
                "Warehouse and storage report will be displayed here."
            );

            break;


        case "Earnings Report":

            showReportMessage(
                "Earnings Report",
                "Earnings and transaction report will be displayed here."
            );

            break;


        default:

            showReportMessage(
                "Report",
                "Report details are not available."
            );

    }

}



/* =========================================================
   REPORT MESSAGE
   ========================================================= */

function showReportMessage(title, message) {

    alert(title + "\n\n" + message);

}