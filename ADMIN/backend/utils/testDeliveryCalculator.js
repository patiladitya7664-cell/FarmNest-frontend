const {
  getVehicleType,
  calculateDeliveryCharge,
} = require("./deliveryChargeCalculator");

console.log("Vehicle Tests:");

console.log("5 kg:", getVehicleType(5));
console.log("20 kg:", getVehicleType(20));
console.log("200 kg:", getVehicleType(200));
console.log("600 kg:", getVehicleType(600));


console.log("\nDelivery Charge Tests:");

console.log("5 kg / 5 km:");
console.log(calculateDeliveryCharge(5, 5));

console.log("20 kg / 10 km:");
console.log(calculateDeliveryCharge(10, 20));

console.log("200 kg / 15 km:");
console.log(calculateDeliveryCharge(15, 200));

console.log("600 kg / 20 km:");
console.log(calculateDeliveryCharge(20, 600));