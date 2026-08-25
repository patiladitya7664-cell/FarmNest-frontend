require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const products = await Product.find({
      name: {
        $in: ["Tomato", "Potato", "Milk"],
      },
    })
      .populate("farmerId", "name email")
      .lean();

    console.table(
      products.map((x) => ({
        id: x._id,
        name: x.name,
        category: x.category,
        price: x.price,
        quantity: x.quantity,
        unit: x.unit,
        status: x.status,
        isAvailable: x.isAvailable,
        farmer: x.farmerId?.name,
        farmerEmail: x.farmerId?.email,
      }))
    );

    console.log("Found:", products.length);

    await mongoose.disconnect();
  })
  .catch(console.error);