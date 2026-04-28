const ApiResponse = require("../../utils/ApiResponse");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return ApiResponse.error(res, "Please upload an image file");
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    return ApiResponse.success(res, "Image uploaded successfully", {
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};
