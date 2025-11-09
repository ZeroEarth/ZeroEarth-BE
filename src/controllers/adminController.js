const {AdminService} = require('../services');
const ExcelJS = require("exceljs");
const withTransaction = require('../utils/withTransaction');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/common');

const adminService = new AdminService();

const createUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.body;

    const response = await withTransaction(async (client) => {
        return await adminService.createUser(client, role, req.body, userId);
    })
    return sendSuccessResponse(res, response, "Successfully created user", 201);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to create user");
  }

}

const getManufacturers = async (req, res) => {
    try {
      const response = await withTransaction(async (client) => {
          return await adminService.getManufacturers(client);
      })
      return sendSuccessResponse(res, response, "Successfully fetched all manufacturers", 200);
    } catch (error) {
        return sendErrorResponse(res, error, "Failed to fetch manufacturers");
    }
  
}

const getUsers = async (req, res) => {
  try {
    const response = await adminService.getUsers(req.query);
    return sendSuccessResponse(res, response, "Users fetched successfully", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to fetch users");
  }
}

const getDashBoardDetails = async (req, res) => {
  try {
    const response = await adminService.getDashboardDetails()
    return sendSuccessResponse(res, response, "Successfully fetched dashboard details", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to fetch dashboard details");
  }

}

const getWeeklyOffsets = async (req, res) => {
  try {
    const response = await adminService.getWeeklyOffsets()
    return sendSuccessResponse(res, response, "Successfully fetched weekly offsets", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to fetch weekly offsets");
  }
}

const getFarmersByMonth = async (req, res) => {
  try {
    const response = await adminService.getFarmersByMonth()
    return sendSuccessResponse(res, response, "Successfully fetched monthly farmer onboarded details", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to fetch monthly farmer onboarded details");
  }
}

const getPotentialOffsets = async (req, res) => {
  try {
    const response = await adminService.getPotentialOffsets()
    return sendSuccessResponse(res, response, "Successfully fetched potential offsets report", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to fetch potential offsets report");
  }
}

const getAllOffsets = async (req, res) => {
  try {
    const response = await adminService.getAllOffsets(req.query)
    return sendSuccessResponse(res, response, "Successfully fetched offsets", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to fetch offsets");
  }
}

const getFractionalOffsetById = async (req, res) => {
  try {
    const offsetId = req.params.offset_id
    const response = await adminService.getFractionalOffsetById(offsetId)
    return sendSuccessResponse(res, response, "Successfully fetched fractional offsets", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to fetch fractional offsets");
  }
}

const exportFractionalOffsetId = async (req, res) => {
  try {
    const offsetId = req.params.offset_id
    const buffer = await adminService.exportFractionalOffsetId(offsetId)
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Offsets_Report.xlsx`
    );
    return res.send(buffer); 
    // return sendSuccessResponse(res, response, "Successfully fetched fractional offsets", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to export fractional offsets");
  }
}

const exportCampleads = async (req, res) => {
  try {
    const buffer = await adminService.exportCampleads()
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=campleads.xlsx`
    );
    return res.send(buffer); 
    // return sendSuccessResponse(res, response, "Successfully fetched fractional offsets", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to export campleads");
  }
}

const exportFarmers = async (req, res) => {
  try {
    const buffer = await adminService.exportFarmers()
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=farmers.xlsx`
    );
    return res.send(buffer); 
    // return sendSuccessResponse(res, response, "Successfully fetched fractional offsets", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to export farmers");
  }
}

const getAllCampLeads = async (req, res) => {
    try {
        const response = await adminService.getAllCampLeads(req.query);
        return sendSuccessResponse(res, response, "Campleads fetched successfully", 200);
    } catch (error) {
        return sendErrorResponse(res, error, "Failed to fetch Campleads");
    }
};

const updateCamplead = async (req, res) => {
  try {
      const { camplead_id } = req.params; 
      const response = await withTransaction(async (client) => {
          return await adminService.updateCamplead(client, {
              camplead_id: parseInt(camplead_id),
              ...req.body
          });
      })
      return sendSuccessResponse(res, response, "Camplead updated successfully", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to update camplead");
  }
};

const updateUser = async (req, res) => {
  try {
      const { user_id } = req.params;
      const response = await withTransaction(async (client) => {
          return await adminService.updateUser(client, parseInt(user_id), req.body);
      });
      return sendSuccessResponse(res, response, "User updated successfully", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to update user");
  }
};

module.exports = {
    createUser,
    getManufacturers,
    getUsers,
    getDashBoardDetails,
    getWeeklyOffsets,
    getFarmersByMonth,
    getPotentialOffsets,
    getAllOffsets,
    getFractionalOffsetById,
    exportFractionalOffsetId,
    getAllCampLeads,
    updateCamplead,
    updateUser,
    exportCampleads,
    exportFarmers
}
