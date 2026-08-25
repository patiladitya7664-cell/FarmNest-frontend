/* ==========================================================
   FARMNEST CHECKOUT JS v4.0
   CUSTOMER → ORDER API
   DELIVERY CHARGE → BACKEND CALCULATION
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:5000/api/orders";

  /* =====================================================
       CART
    ===================================================== */

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  /* =====================================================
       DOM ELEMENTS
    ===================================================== */

  const checkoutItems = document.getElementById("checkoutItems");

  const checkoutTotal = document.getElementById("checkoutTotal");

  const checkoutForm = document.getElementById("checkoutForm");

  const distanceInput = document.getElementById("distance");

  const deliveryDistance = document.getElementById("deliveryDistance");

  const deliveryWeight = document.getElementById("deliveryWeight");

  const deliveryVehicle = document.getElementById("deliveryVehicle");

  const deliveryCharge = document.getElementById("deliveryCharge");

  /* =====================================================
       LOAD CHECKOUT
    ===================================================== */

  function loadCheckout() {
    if (!checkoutItems) return;

    checkoutItems.innerHTML = "";

    /* EMPTY CART */

    if (cart.length === 0) {
      checkoutItems.innerHTML = `
                <div class="checkout-empty">

                    <i class="fa-solid fa-cart-shopping"></i>

                    <h3>Your Cart is Empty</h3>

                    <p>Add some fresh products to continue.</p>

                    <a href="products.html" class="shop-btn">

                        <i class="fa-solid fa-bag-shopping"></i>

                        Shop Products

                    </a>

                </div>
            `;

      if (checkoutTotal) {
        checkoutTotal.innerHTML = "₹0";
      }

      return;
    }

    /* SUBTOTAL */

    let subtotal = 0;

    cart.forEach((item) => {
      const qty = Number(item.quantity) || 1;

      const price = Number(item.price) || 0;

      subtotal += price * qty;

      checkoutItems.innerHTML += `

                <div class="checkout-item">

                    <div>

                        <h4>
                            ${item.name || "Product"}
                        </h4>

                        <small>
                            Qty: ${qty} ${item.unit || "kg"}
                        </small>

                    </div>

                    <span>
                        ₹${(price * qty).toFixed(2)}
                    </span>

                </div>

            `;
    });

    /*
        Product subtotal only.
        Delivery charge will be calculated by backend.
        */

    if (checkoutTotal) {
      checkoutTotal.innerHTML = "₹" + subtotal.toFixed(2);
    }
  }

  /* =====================================================
       GET ITEM WEIGHT
    ===================================================== */

  function getItemWeight(item) {
    /*
        Priority:

        1. weightPerUnit
        2. weight
        3. quantity when unit is kg
        4. 0
        */

    const weightPerUnit = Number(item.weightPerUnit);

    if (Number.isFinite(weightPerUnit) && weightPerUnit > 0) {
      return weightPerUnit;
    }

    const weight = Number(item.weight);

    if (Number.isFinite(weight) && weight > 0) {
      return weight;
    }

    /*
        If quantity itself represents KG,
        use quantity as weight.
        */

    const unit = String(item.unit || "")
      .toLowerCase()
      .trim();

    if (
      unit === "kg" ||
      unit === "kgs" ||
      unit === "kilogram" ||
      unit === "kilograms"
    ) {
      const quantity = Number(item.quantity) || 0;

      return quantity;
    }

    return 0;
  }

  /* =====================================================
       CALCULATE TOTAL CART WEIGHT
    ===================================================== */

  function calculateTotalWeight() {
    let totalWeight = 0;

    cart.forEach((item) => {
      const quantity = Number(item.quantity) || 1;

      const weightPerUnit = getItemWeight(item);

      /*
            If weightPerUnit is already equal to
            the complete quantity weight, avoid
            multiplying twice when unit is KG.
            */

      const unit = String(item.unit || "")
        .toLowerCase()
        .trim();

      if (
        unit === "kg" ||
        unit === "kgs" ||
        unit === "kilogram" ||
        unit === "kilograms"
      ) {
        /*
                For KG products:

                quantity = actual weight

                Example:
                quantity = 5
                unit = kg

                Total = 5 KG
                */

        totalWeight += quantity;
      } else {
        /*
                For piece/unit products:

                weightPerUnit × quantity
                */

        totalWeight += weightPerUnit * quantity;
      }
    });

    return totalWeight;
  }

  /* =====================================================
       UPDATE DELIVERY PREVIEW
    ===================================================== */

  function updateDeliveryPreview() {
    const distance = Number(distanceInput?.value) || 0;

    const totalWeight = calculateTotalWeight();

    /* ===============================
           DISTANCE
        =============================== */

    if (deliveryDistance) {
      deliveryDistance.innerText = distance.toFixed(1) + " KM";
    }

    /* ===============================
           WEIGHT
        =============================== */

    if (deliveryWeight) {
      deliveryWeight.innerText = totalWeight.toFixed(2) + " KG";
    }

    /* ===============================
           VEHICLE BY WEIGHT
        =============================== */

    let vehicle = "-";

    if (totalWeight > 0 && totalWeight <= 10) {
      vehicle = "Bike";
    } else if (totalWeight > 10 && totalWeight <= 100) {
      vehicle = "Auto";
    } else if (totalWeight > 100 && totalWeight <= 500) {
      vehicle = "Small Truck";
    } else if (totalWeight > 500) {
      vehicle = "Larger Vehicle";
    }

    if (deliveryVehicle) {
      deliveryVehicle.innerText = vehicle;
    }

    /* ===============================
           DELIVERY CHARGE
           BACKEND WILL CALCULATE
        =============================== */

    if (deliveryCharge) {
      deliveryCharge.innerText = "Calculated at order";
    }
  }

  /* =====================================================
       DISTANCE INPUT CHANGE
    ===================================================== */

  if (distanceInput) {
    distanceInput.addEventListener("input", updateDeliveryPreview);

    distanceInput.addEventListener("change", updateDeliveryPreview);
  }

  /* =====================================================
       PLACE ORDER
    ===================================================== */

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      /* =========================================
                   RELOAD CART
                ========================================= */

      cart = JSON.parse(localStorage.getItem("cart")) || [];

      /* =========================================
                   CART CHECK
                ========================================= */

      if (cart.length === 0) {
        alert("Your cart is empty.");

        return;
      }

      /* =========================================
                   CUSTOMER DETAILS
                ========================================= */

      const name = document.getElementById("customerName")?.value.trim();

      const email = document.getElementById("customerEmail")?.value.trim();

      const phone = document.getElementById("customerPhone")?.value.trim();

      const address = document.getElementById("deliveryAddress")?.value.trim();

      const city = document.getElementById("city")?.value.trim();

      const state = document.getElementById("state")?.value.trim();

      const pincode = document.getElementById("pincode")?.value.trim();

      /* =========================================
                   DISTANCE
                ========================================= */

      const distance = Number(distanceInput?.value);

      if (!Number.isFinite(distance) || distance < 0) {
        alert("Please enter a valid delivery distance.");

        return;
      }

      /* =========================================
                   VALIDATE CUSTOMER DETAILS
                ========================================= */

      if (
        !name ||
        !email ||
        !phone ||
        !address ||
        !city ||
        !state ||
        !pincode
      ) {
        alert("Please fill all delivery details.");

        return;
      }

      /* =========================================
                   PAYMENT METHOD
                ========================================= */

      const paymentInput = checkoutForm.querySelector(
        'input[name="payment"]:checked',
      );

      const paymentMethod = paymentInput ? paymentInput.value : "COD";

      /* =========================================
                   SHIPPING ADDRESS
                ========================================= */

      const shippingAddress = {
        name: name,

        phone: phone,

        address: address,

        city: city,

        state: state,

        pincode: pincode,
      };

      /* =========================================
                   PRODUCTS
                ========================================= */

      const products = cart.map((item) => ({
        productId: item.productId,

        quantity: Number(item.quantity) || 1,
      }));

      /* =========================================
                   VALIDATE PRODUCT IDS
                ========================================= */

      const invalidProduct = products.some((item) => !item.productId);

      if (invalidProduct) {
        alert("Some cart products are invalid. Please add the products again.");

        return;
      }

      /* =========================================
                   TOKEN
                ========================================= */

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login before placing an order.");

        return;
      }

      /* =========================================
                   DISABLE BUTTON
                ========================================= */

      const submitButton = checkoutForm.querySelector('button[type="submit"]');

      if (submitButton) {
        submitButton.disabled = true;

        submitButton.innerText = "Placing Order...";
      }

      /* =========================================
                   CREATE ORDER
                ========================================= */

      try {
        console.log("Cart:", cart);

        console.log("Products:", products);

        console.log(
          "Calculated Frontend Weight:",
          calculateTotalWeight(),
          "KG",
        );

        const response = await fetch(API_URL, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: "Bearer " + token,
          },

          body: JSON.stringify({
            products,

            shippingAddress,

            paymentMethod,

            distance,
          }),
        });

        /* =====================================
                       RESPONSE
                    ===================================== */

        const data = await response.json();

        console.log("Backend Response:", data);

        /* =====================================
                       API ERROR
                    ===================================== */

        if (!response.ok) {
          throw new Error(data.message || "Failed to place order");
        }

        /* =====================================
                       SUCCESS
                    ===================================== */

        console.log("Order Created:", data.order);

        console.log("Delivery Details:", data.delivery);

        /* =====================================
                       SHOW BACKEND DELIVERY DATA
                    ===================================== */

        if (data.delivery) {
          if (deliveryDistance) {
            deliveryDistance.innerText =
              Number(data.delivery.distance).toFixed(1) + " KM";
          }

          if (deliveryWeight) {
            deliveryWeight.innerText =
              Number(data.delivery.totalWeight).toFixed(2) + " KG";
          }

          if (deliveryVehicle) {
            deliveryVehicle.innerText = data.delivery.vehicleType || "-";
          }

          if (deliveryCharge) {
            deliveryCharge.innerText =
              "₹" + Number(data.delivery.deliveryCharge).toFixed(2);
          }
        }

        /* =====================================
                       SUCCESS MESSAGE
                    ===================================== */

        alert("🎉 Order placed successfully!");

        /* =====================================
                       CLEAR CART
                    ===================================== */

        localStorage.removeItem("cart");

        /* =====================================
                       SAVE ORDER ID
                    ===================================== */

        if (data.order && data.order._id) {
          localStorage.setItem("lastOrderId", data.order._id);
        }

        /* =====================================
                       GO TO TRACKING
                    ===================================== */

        window.location.href = "tracking.html";
      } catch (error) {
        console.error("Order Error:", error);

        alert(error.message || "Failed to place order.");

        /* =====================================
                       ENABLE BUTTON AGAIN
                    ===================================== */

        if (submitButton) {
          submitButton.disabled = false;

          submitButton.innerText = "Place Order";
        }
      }
    });
  }

  /* =====================================================
       START CHECKOUT
    ===================================================== */

  loadCheckout();

  updateDeliveryPreview();
});
