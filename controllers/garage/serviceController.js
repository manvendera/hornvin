// ─────────────────────────────────────────────────────────
//  controllers/garage/serviceController.js
// ─────────────────────────────────────────────────────────
const Vehicle = require("../../models/Vehicle");
const ServiceJob = require("../../models/ServiceJob");
const JobCard = require("../../models/JobCard");
const Garage = require("../../models/Garage");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * POST /api/garage/vehicles
 */
exports.addVehicle = async (req, res) => {
  try {
    const garage = await Garage.findOne({ owner: req.user._id });
    const vehicle = await Vehicle.create({ ...req.body, garage: garage._id });
    return ApiResponse.created(res, "Vehicle added to database", { vehicle });
  } catch (error) {
    if (error.code === 11000) return ApiResponse.error(res, "Vehicle already registered", 400);
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/garage/services
 * Create a new service job
 */
exports.createServiceJob = async (req, res) => {
  try {
    const garage = await Garage.findOne({ owner: req.user._id });
    const { vehicleId, serviceType, scheduledDate, complaints } = req.body;

    const job = await ServiceJob.create({
      garage: garage._id,
      vehicle: vehicleId,
      serviceType,
      scheduledDate,
      complaints,
      status: "scheduled"
    });

    return ApiResponse.created(res, "Service job created", { job });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/garage/job-cards
 * Generate job card for a service job
 */
exports.generateJobCard = async (req, res) => {
  try {
    const garage = await Garage.findOne({ owner: req.user._id });
    const { serviceJobId, inspectionDetails } = req.body;

    const jobNumber = "JC-" + Date.now().toString().slice(-6);
    const jobCard = await JobCard.create({
      jobNumber,
      serviceJob: serviceJobId,
      garage: garage._id,
      inspectionDetails,
      status: "CREATED"
    });

    // Link job card back to service job
    await ServiceJob.findByIdAndUpdate(serviceJobId, { jobCard: jobCard._id, status: "received" });

    return ApiResponse.created(res, "Job card generated", { jobCard });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * PATCH /api/garage/services/:id
 * Update status (CREATED -> IN_PROGRESS -> COMPLETED)
 */
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await ServiceJob.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (status === "delivered") {
      await Vehicle.findByIdAndUpdate(job.vehicle, { lastServiceDate: new Date() });
    }

    return ApiResponse.success(res, "Status updated", { job });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/garage/vehicles/:id/history
 */
exports.getVehicleHistory = async (req, res) => {
  try {
    const history = await ServiceJob.find({ vehicle: req.params.id })
      .populate("jobCard")
      .populate("assignedStaff", "user")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, "Vehicle service history", { history });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
