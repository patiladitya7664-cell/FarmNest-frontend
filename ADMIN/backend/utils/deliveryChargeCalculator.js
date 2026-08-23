// ==========================================================
// FARMNEST DELIVERY CHARGE CALCULATOR
// ==========================================================

// Vehicle selection based on total order weight
const getVehicleType = (weight) => {
  if (weight <= 10) {
    return "Bike";
  }

  if (weight <= 100) {
    return "Auto";
  }

  if (weight <= 500) {
    return "Small Truck";
  }

  return "Larger Vehicle";
};


// Vehicle-wise delivery pricing
const VEHICLE_RATES = {
  Bike: {
    baseCharge: 20,
    perKm: 8,
    weightCharge: 0,
  },

  Auto: {
    baseCharge: 40,
    perKm: 12,
    weightCharge: 1,
  },

  "Small Truck": {
    baseCharge: 80,
    perKm: 18,
    weightCharge: 1.5,
  },

  "Larger Vehicle": {
    baseCharge: 150,
    perKm: 25,
    weightCharge: 2,
  },
};


// Calculate final delivery charge
const calculateDeliveryCharge = (distance, weight) => {

  // Select vehicle automatically
  const vehicleType = getVehicleType(weight);

  // Get vehicle pricing
  const rate = VEHICLE_RATES[vehicleType];

  // Distance charge
  const distanceCharge = distance * rate.perKm;

  // Weight charge
  const weightCharge = weight * rate.weightCharge;

  // Final charge
  const deliveryCharge =
    rate.baseCharge +
    distanceCharge +
    weightCharge;

  return {
    distance,
    weight,
    vehicleType,
    baseCharge: rate.baseCharge,
    distanceCharge,
    weightCharge,
    deliveryCharge: Math.round(deliveryCharge),
  };
};


module.exports = {
  getVehicleType,
  calculateDeliveryCharge,
};