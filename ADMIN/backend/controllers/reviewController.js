const mongoose = require("mongoose");

const Review = require("../models/Review");
const Product = require("../models/Product");

// =====================================================
// HELPER
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =====================================================
// FORMAT REVIEW
// =====================================================

const formatReview = (review) => {
  return {
    _id: review._id,

    customer: review.customerId
      ? {
          _id: review.customerId._id,
          name: review.customerId.name || "N/A",
          email: review.customerId.email || "N/A",
          phone: review.customerId.phone || "N/A",
        }
      : null,

    product: review.productId
      ? {
          _id: review.productId._id,
          name: review.productId.name || "N/A",
          category: review.productId.category || "N/A",

          farmer: review.productId.farmerId
            ? {
                _id: review.productId.farmerId._id,
                name: review.productId.farmerId.name || "N/A",
                email: review.productId.farmerId.email || "N/A",
                phone: review.productId.farmerId.phone || "N/A",
              }
            : null,
        }
      : null,

    orderId: review.orderId
      ? review.orderId._id
      : null,

    rating: Number(review.rating) || 0,

    message: review.message || "",

    adminReply: review.adminReply || "",

    adminReplyAt: review.adminReplyAt || null,

    createdAt: review.createdAt,

    updatedAt: review.updatedAt,
  };
};

// =====================================================
// ADMIN - GET REVIEW STATISTICS
// =====================================================

const getReviewStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();

    const positive = await Review.countDocuments({
      rating: {
        $gte: 4,
      },
    });

    const average = await Review.countDocuments({
      rating: 3,
    });

    const negative = await Review.countDocuments({
      rating: {
        $lte: 2,
      },
    });

    const aggregation = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);

    const averageRating =
      aggregation.length > 0
        ? Number(aggregation[0].averageRating).toFixed(1)
        : "0.0";

    return res.status(200).json({
      success: true,

      stats: {
        totalReviews,
        positive,
        average,
        negative,
        averageRating,
      },
    });
  } catch (error) {
    console.error("❌ Review Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch review statistics",
    });
  }
};

// =====================================================
// ADMIN - GET ALL REVIEWS
// =====================================================

const getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      rating = "all",
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);

    const pageLimit = Math.max(Number(limit) || 10, 1);

    const query = {};

    // =================================================
    // RATING FILTER
    // =================================================

    if (
      rating !== "all" &&
      ["1", "2", "3", "4", "5"].includes(String(rating))
    ) {
      query.rating = Number(rating);
    }

    // =================================================
    // FETCH REVIEWS
    // =================================================

    let reviews = await Review.find(query)
      .populate(
        "customerId",
        "name email phone"
      )
      .populate({
        path: "productId",
        select: "name category farmerId",
        populate: {
          path: "farmerId",
          select: "name email phone",
        },
      })
      .populate("orderId", "_id")
      .sort({
        createdAt: -1,
      })
      .lean();

    // =================================================
    // SEARCH
    // =================================================

    if (search.trim()) {
      const value = search.trim().toLowerCase();

      reviews = reviews.filter((review) => {
        const customerName =
          review.customerId?.name?.toLowerCase() || "";

        const productName =
          review.productId?.name?.toLowerCase() || "";

        const farmerName =
          review.productId?.farmerId?.name?.toLowerCase() || "";

        const message =
          review.message?.toLowerCase() || "";

        return (
          customerName.includes(value) ||
          productName.includes(value) ||
          farmerName.includes(value) ||
          message.includes(value)
        );
      });
    }

    // =================================================
    // PAGINATION
    // =================================================

    const total = reviews.length;

    const skip = (currentPage - 1) * pageLimit;

    const paginatedReviews = reviews.slice(
      skip,
      skip + pageLimit
    );

    const formattedReviews =
      paginatedReviews.map(formatReview);

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      reviews: formattedReviews,

      pagination: {
        total,
        currentPage,

        totalPages:
          Math.ceil(total / pageLimit) || 1,

        limit: pageLimit,
      },
    });
  } catch (error) {
    console.error("❌ Get Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// =====================================================
// ADMIN - GET SINGLE REVIEW
// =====================================================

const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(id)
      .populate(
        "customerId",
        "name email phone"
      )
      .populate({
        path: "productId",
        select: "name category farmerId",
        populate: {
          path: "farmerId",
          select: "name email phone",
        },
      })
      .populate("orderId", "_id")
      .lean();

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      review: formatReview(review),
    });
  } catch (error) {
    console.error("❌ Get Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch review",
    });
  }
};

// =====================================================
// ADMIN - DELETE REVIEW
// =====================================================

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await Review.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

// =====================================================
// ADMIN - REPLY TO REVIEW
// =====================================================

const replyToReview = async (req, res) => {
  try {
    const { id } = req.params;

    const { reply } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    if (!reply || !reply.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.adminReply = reply.trim();

    review.adminReplyAt = new Date();

    await review.save();

    return res.status(200).json({
      success: true,

      message: "Reply sent successfully",

      review: {
        _id: review._id,
        adminReply: review.adminReply,
        adminReplyAt: review.adminReplyAt,
      },
    });
  } catch (error) {
    console.error("❌ Reply Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send reply",
    });
  }
};

// =====================================================
// CUSTOMER - CREATE REVIEW
// =====================================================

const createReview = async (req, res) => {
  try {
    const customerId = req.user.id;

    const {
      productId,
      orderId,
      rating,
      message,
    } = req.body;

    // =================================================
    // PRODUCT ID
    // =================================================

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // =================================================
    // RATING
    // =================================================

    const numericRating = Number(rating);

    if (
      !numericRating ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // =================================================
    // MESSAGE
    // =================================================

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Review message is required",
      });
    }

    // =================================================
    // PRODUCT CHECK
    // =================================================

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // =================================================
    // DUPLICATE REVIEW CHECK
    // =================================================

    const existing = await Review.findOne({
      customerId,
      productId,
      orderId: orderId || null,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // =================================================
    // CREATE
    // =================================================

    const review = await Review.create({
      customerId,
      productId,
      orderId: orderId || null,
      rating: numericRating,
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("❌ Create Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getReviewStats,
  getAllReviews,
  getReviewById,
  deleteReview,
  replyToReview,
  createReview,
};
