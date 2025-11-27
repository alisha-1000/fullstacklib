const { BookModel } = require("../model/BookModel");
const { BorrowModel } = require("../model/BorrowModel");
const { setCache, getCache } = require("../utils/cache");

const homeController = {
  getHomeData: async (req, res) => {
    try {
      // Check cache
      const cachedData = getCache("homeData");
      if (cachedData) {
        return res.status(200).json({
          error: false,
          message: "Homepage data fetched from cache",
          ...cachedData
        });
      }

      // ----------- STATS -----------
      const totalBooks = await BookModel.countDocuments();
      const totalCategories = (await BookModel.distinct("category")).length;

      // ----------- TOP CATEGORIES -----------
      const categoriesRaw = await BookModel.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            coverImage: { $first: "$coverImage" }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 4 }
      ]);

      const categories = categoriesRaw.map(c => ({
        category: c._id,
        count: c.count,
        coverImage:
          c.coverImage && c.coverImage.trim() !== ""
            ? c.coverImage
            : "https://via.placeholder.com/150x200?text=No+Cover"
      }));

      // ----------- NEW ARRIVALS -----------
      let newArrivals = await BookModel.find()
        .sort({ createdAt: -1 }) // safe because timestamps enabled
        .limit(4)
        .select("title author category coverImage");

      newArrivals = newArrivals.map(b => ({
        ...b._doc,
        coverImage:
          b.coverImage && b.coverImage.trim() !== ""
            ? b.coverImage
            : "https://via.placeholder.com/150x200?text=No+Cover"
      }));

      // ----------- ACTIVE STUDENTS -----------
      const issuedBooks = await BorrowModel.find({ status: "Issued" }).select("userId");

      const activeStudents = new Set(
        issuedBooks
          .filter(i => i.userId) // avoid crash
          .map(i => i.userId.toString())
      );

      const totalActiveStudents = activeStudents.size;

      // ----------- RESPONSE DATA -----------
      const responseData = {
        stats: {
          totalBooks,
          totalCategories,
          totalActiveStudents
        },
        categories,
        newArrivals
      };

      // Save to cache
      setCache("homeData", responseData);

      res.status(200).json({
        error: false,
        message: "Homepage data fetched successfully",
        ...responseData
      });
    } catch (error) {
      console.error("🔥 HOME API ERROR:", error);
      res.status(500).json({
        error: true,
        message: "Internal Server Error",
        details: error.message
      });
    }
  }
};

module.exports = { homeController };

