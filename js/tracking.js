/* ==========================================================
   FARMNEST TRACKING JS v3.0
   CUSTOMER → REAL ORDER TRACKING API
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "http://localhost:5000/api/orders";

  /* ======================================================
       GET ELEMENTS
    ====================================================== */

  const orderIdElement = document.getElementById("orderId");

  const orderStatusElement = document.getElementById("orderStatus");

  const trackingDistance = document.getElementById("trackingDistance");

  const trackingWeight = document.getElementById("trackingWeight");

  const trackingVehicle = document.getElementById("trackingVehicle");

  const trackingCharge = document.getElementById("trackingCharge");

  const farmerName = document.getElementById("farmerName");

  const farmerInfo = document.getElementById("farmerInfo");

  /* ======================================================
       GET LAST ORDER ID
    ====================================================== */

  const lastOrderId = localStorage.getItem("lastOrderId");

  console.log("Tracking Order ID:", lastOrderId);

  if (!lastOrderId) {
    if (orderIdElement) {
      orderIdElement.innerText = "No Order Found";
    }

    if (orderStatusElement) {
      orderStatusElement.innerText = "Please place an order first";
    }

    return;
  }

  /* ======================================================
       GET LOGIN TOKEN
    ====================================================== */

  const token = localStorage.getItem("token");

  console.log("Tracking Token Available:", !!token);

  if (!token) {
    if (orderStatusElement) {
      orderStatusElement.innerText = "Please login to view your order.";
    }

    alert("Please login to view your order.");

    return;
  }

  /* ======================================================
       FETCH ORDER FROM BACKEND
    ====================================================== */

  try {
    const response = await fetch(`${API_URL}/${lastOrderId}`, {
      method: "GET",

      headers: {
        "Content-Type": "application/json",

        Authorization: "Bearer " + token,
      },
    });

    const data = await response.json();

    console.log("Tracking API Response:", data);

    /* ==================================================
           API ERROR
        ================================================== */

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch order");
    }

    /* ==================================================
           GET ORDER
        ================================================== */

    const order = data.order;

    if (!order) {
      throw new Error("Order data not found");
    }

    /* ==================================================
           ORDER ID
        ================================================== */

    if (orderIdElement) {
      orderIdElement.innerText = "#" + order._id;
    }

    /* ==================================================
           ORDER STATUS
        ================================================== */

    const currentStatus = order.status || "Pending";

    if (orderStatusElement) {
      orderStatusElement.innerText = currentStatus;

      orderStatusElement.className = "status";

      orderStatusElement.classList.add(
        currentStatus.toLowerCase().replaceAll(" ", "-"),
      );
    }

    /* ==================================================
           DELIVERY DISTANCE
        ================================================== */

    if (trackingDistance) {
      trackingDistance.innerText =
        Number(order.distance || 0).toFixed(1) + " KM";
    }

    /* ==================================================
           TOTAL WEIGHT
        ================================================== */

    if (trackingWeight) {
      trackingWeight.innerText =
        Number(order.totalWeight || 0).toFixed(2) + " KG";
    }

    /* ==================================================
           VEHICLE
        ================================================== */

    if (trackingVehicle) {
      trackingVehicle.innerText = order.vehicleType || "-";
    }

    /* ==================================================
           DELIVERY CHARGE
        ================================================== */

    if (trackingCharge) {
      trackingCharge.innerText =
        "₹" + Number(order.deliveryCharge || 0).toFixed(2);
    }

    /* ==================================================
   FARMER INFORMATION
================================================== */

    let farmerFound = false;

    if (order.products && order.products.length > 0) {
      for (const item of order.products) {
        const product = item.productId;

        if (product && product.farmerId) {
          farmerFound = true;

          // Farmer is populated object
          if (typeof product.farmerId === "object") {
            if (farmerName) {
              farmerName.innerText = product.farmerId.name || "FarmNest Farmer";
            }

            if (farmerInfo) {
              farmerInfo.innerText = "Farmer ID: " + product.farmerId._id;
            }
          } else {
            // Fallback if farmerId is only an ID
            if (farmerName) {
              farmerName.innerText = "FarmNest Farmer";
            }

            if (farmerInfo) {
              farmerInfo.innerText = "Farmer ID: " + product.farmerId;
            }
          }

          break;
        }
      }
    }

    /* ==================================================
   FARMER FALLBACK
================================================== */

    if (!farmerFound) {
      if (farmerName) {
        farmerName.innerText = "FarmNest Farmer";
      }

      if (farmerInfo) {
        farmerInfo.innerText = "Farmer Information";
      }
    }
    
    /* ==================================================
           UPDATE TIMELINE
        ================================================== */

    updateTimeline(currentStatus);

    /* ==================================================
           CANCELLED ORDER
        ================================================== */

    if (currentStatus === "Cancelled") {
      const steps = document.querySelectorAll(".timeline .step");

      steps.forEach((step) => {
        step.classList.remove("active");
      });
    }

    /* ==================================================
           CONSOLE SUCCESS
        ================================================== */

    console.log("=================================");

    console.log("FarmNest Tracking Loaded");

    console.log("Order ID:", order._id);

    console.log("Status:", currentStatus);

    console.log("Total:", order.totalAmount);

    console.log("=================================");
  } catch (error) {
    console.error("Tracking Error:", error);

    if (orderIdElement) {
      orderIdElement.innerText = "Error";
    }

    if (orderStatusElement) {
      orderStatusElement.innerText = error.message || "Unable to load order";
    }
  }

  /* ======================================================
       UPDATE TIMELINE
    ====================================================== */

  function updateTimeline(status) {
    const steps = document.querySelectorAll(".timeline .step");

    if (!steps.length) {
      console.warn("Timeline steps not found.");

      return;
    }

    const statusOrder = [
      "Pending",

      "Confirmed",

      "Processing",

      "Shipped",

      "Out for Delivery",

      "Delivered",
    ];

    let currentIndex = statusOrder.indexOf(status);

    /* ----------------------------------------------
           UNKNOWN STATUS
        ---------------------------------------------- */

    if (currentIndex < 0) {
      currentIndex = 0;
    }

    /* ----------------------------------------------
           UPDATE STEPS
        ---------------------------------------------- */

    steps.forEach((step, index) => {
      step.classList.remove("active");

      const stepStatus = step.dataset.status;

      const stepIndex = statusOrder.indexOf(stepStatus);

      if (stepIndex !== -1 && stepIndex <= currentIndex) {
        step.classList.add("active");
      }
    });
  }
});
