// ─────────────────────────────────────────────────────────
//  controllers/admin/productController.js — Product & Category CRUD
// ─────────────────────────────────────────────────────────
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const Inventory = require("../../models/Inventory");
const ApiResponse = require("../../utils/ApiResponse");
const { logAction } = require("../../services/auditService");

// ═══════════════════════════════════════════════════════
//  PRODUCT CRUD
// ═══════════════════════════════════════════════════════

// POST /api/admin/products
exports.createProduct = async (req, res) => {
  try {
    const {
      name, sku, description, shortDescription, price, mrp, costPrice,
      gstRate, hsnCode, category, brand, tags, images, specifications,
      stock, lowStockThreshold, isFeatured,
    } = req.body;

    if (!sku) {
      return ApiResponse.error(res, "SKU is required", 400);
    }

    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return ApiResponse.error(res, "Product with this SKU already exists", 409);
    }

    let categoryId = category;
    if (category && typeof category === "string" && category.length < 24) {
      // It's likely a category name, not an ID
      let categoryDoc = await Category.findOne({
        name: { $regex: new RegExp(`^${category}$`, "i") },
      });
      if (!categoryDoc) {
        categoryDoc = await Category.create({
          name: category,
          createdBy: req.user._id,
        });
      }
      categoryId = categoryDoc._id;
    }

    const product = await Product.create({
      name, sku: sku.toUpperCase(), description, shortDescription,
      price, mrp, costPrice, gstRate, hsnCode, category: categoryId, brand,
      tags, images, specifications, stock: stock || 0,
      lowStockThreshold: lowStockThreshold || 10,
      isFeatured: isFeatured || false,
      createdBy: req.user._id,
    });

    // Create inventory record
    await Inventory.create({
      product: product._id,
      globalStock: stock || 0,
      lowStockThreshold: lowStockThreshold || 10,
      history: [{
        type: "restock",
        quantity: stock || 0,
        previousStock: 0,
        newStock: stock || 0,
        performedBy: req.user._id,
        note: "Initial stock on product creation",
      }],
    });

    await logAction(req, {
      action: "CREATE", entity: "Product",
      entityId: product._id, details: { name, sku, price },
    });

    return ApiResponse.created(res, "Product created successfully", { product });
  } catch (error) {
    console.error("Create product error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// GET /api/admin/products
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const categoryFilter = req.query.category;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const inStock = req.query.inStock;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }
    if (categoryFilter) filter.category = categoryFilter;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (inStock === "true") filter.isInStock = true;
    if (inStock === "false") filter.isInStock = false;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return ApiResponse.success(res, "Products retrieved", {
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// GET /api/admin/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate("createdBy", "name email");

    if (!product) return ApiResponse.notFound(res, "Product not found");

    return ApiResponse.success(res, "Product retrieved", { product });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// PUT /api/admin/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return ApiResponse.notFound(res, "Product not found");

    const allowedFields = [
      "name", "description", "shortDescription", "price", "mrp", "costPrice",
      "gstRate", "hsnCode", "category", "brand", "tags", "images",
      "specifications", "stock", "lowStockThreshold", "isActive", "isFeatured",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });
    product.updatedBy = req.user._id;
    await product.save();

    // Sync inventory if stock changed
    if (req.body.stock !== undefined) {
      await Inventory.findOneAndUpdate(
        { product: product._id },
        {
          globalStock: req.body.stock,
          $push: {
            history: {
              type: "adjustment",
              quantity: req.body.stock,
              performedBy: req.user._id,
              note: "Stock adjusted via product update",
            },
          },
        }
      );
    }

    await logAction(req, {
      action: "UPDATE", entity: "Product",
      entityId: product._id, details: req.body,
    });

    return ApiResponse.success(res, "Product updated", { product });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// DELETE /api/admin/products/:id (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return ApiResponse.notFound(res, "Product not found");

    product.isDeleted = true;
    product.isActive = false;
    product.deletedAt = new Date();
    await product.save();

    await logAction(req, {
      action: "DELETE", entity: "Product",
      entityId: product._id, details: { name: product.name },
    });

    return ApiResponse.success(res, "Product deleted successfully");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// ═══════════════════════════════════════════════════════
//  CATEGORY CRUD
// ═══════════════════════════════════════════════════════

// POST /api/admin/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, parentCategory, sortOrder } = req.body;

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) return ApiResponse.error(res, "Category already exists", 409);

    const category = await Category.create({
      name, description, image,
      parentCategory: parentCategory || null,
      sortOrder: sortOrder || 0,
      createdBy: req.user._id,
    });

    await logAction(req, {
      action: "CREATE", entity: "Category",
      entityId: category._id, details: { name },
    });

    return ApiResponse.created(res, "Category created", { category });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// GET /api/admin/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate("parentCategory", "name slug")
      .sort({ sortOrder: 1, name: 1 });

    return ApiResponse.success(res, "Categories retrieved", { categories });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// PUT /api/admin/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, image, parentCategory, sortOrder, isActive } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return ApiResponse.notFound(res, "Category not found");

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (parentCategory !== undefined) category.parentCategory = parentCategory;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;
    await category.save();

    await logAction(req, {
      action: "UPDATE", entity: "Category",
      entityId: category._id, details: req.body,
    });

    return ApiResponse.success(res, "Category updated", { category });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// DELETE /api/admin/categories/:id (soft delete)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return ApiResponse.notFound(res, "Category not found");

    // Check if products use this category
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return ApiResponse.error(
        res,
        `Cannot delete: ${productCount} products use this category. Reassign them first.`
      );
    }

    category.isDeleted = true;
    category.isActive = false;
    await category.save();

    await logAction(req, {
      action: "DELETE", entity: "Category",
      entityId: category._id, details: { name: category.name },
    });

    return ApiResponse.success(res, "Category deleted");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// ═══════════════════════════════════════════════════════
//  BULK UPLOAD
// ═══════════════════════════════════════════════════════
exports.bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return ApiResponse.error(res, "Please upload a CSV or Excel file");
    }

    const results = [];
    const errors = [];
    let rows = [];

    const ext = req.file.originalname.split(".").pop().toLowerCase();

    if (ext === "csv") {
      const csv = require("csv-parser");
      const { Readable } = require("stream");
      const stream = Readable.from(req.file.buffer);

      await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on("data", (row) => rows.push(row))
          .on("end", resolve)
          .on("error", reject);
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const XLSX = require("xlsx");
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      return ApiResponse.error(res, "Unsupported file format. Use CSV or XLSX.");
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.name || !row.sku || !row.price || !row.category) {
          errors.push({ row: i + 1, error: "Missing required fields (name, sku, price, category)" });
          continue;
        }

        const existingSku = await Product.findOne({ sku: row.sku.toUpperCase() });
        if (existingSku) {
          errors.push({ row: i + 1, error: `SKU ${row.sku} already exists` });
          continue;
        }

        // Find category by name
        let category = await Category.findOne({
          name: { $regex: new RegExp(`^${row.category}$`, "i") },
        });
        if (!category) {
          category = await Category.create({
            name: row.category,
            createdBy: req.user._id,
          });
        }

        const product = await Product.create({
          name: row.name,
          sku: row.sku.toUpperCase(),
          description: row.description || row.name,
          price: parseFloat(row.price),
          mrp: row.mrp ? parseFloat(row.mrp) : undefined,
          costPrice: row.costPrice ? parseFloat(row.costPrice) : undefined,
          gstRate: row.gstRate ? parseInt(row.gstRate) : 18,
          hsnCode: row.hsnCode,
          category: category._id,
          brand: row.brand,
          stock: row.stock ? parseInt(row.stock) : 0,
          createdBy: req.user._id,
        });

        await Inventory.create({
          product: product._id,
          globalStock: parseInt(row.stock) || 0,
          lowStockThreshold: parseInt(row.lowStockThreshold) || 10,
        });

        results.push({ row: i + 1, productId: product._id, name: product.name });
      } catch (err) {
        errors.push({ row: i + 1, error: err.message });
      }
    }

    await logAction(req, {
      action: "BULK_UPLOAD", entity: "Product",
      details: { totalRows: rows.length, success: results.length, failed: errors.length },
    });

    return ApiResponse.success(res, "Bulk upload completed", {
      summary: { total: rows.length, success: results.length, failed: errors.length },
      results,
      errors,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};
