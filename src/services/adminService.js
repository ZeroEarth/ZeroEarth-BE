const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require("uuid");
const ExcelJS = require("exceljs");
const CustomError = require("../utils/customError")


const { SALT_ROUNDS, DEFAULT_PASSWORD} = require("../config/serverConfig");
const { AdminRepository, CommunityMgtRepository, ManufactureRepository } = require("../repositories");
const ALLOWED_ROLES = ['admin', 'manufacturer', 'camp_lead', 'auditor', 'farmer'];
const DEFAULT_USER_ROLES = ['admin', 'manufacturer', 'camp_lead','auditor', 'farmer'];

class AdminService {
    constructor() {
        this.adminRepository = new AdminRepository();
        this.communityMgtRepository = new CommunityMgtRepository();
        this.manufactureRepository = new ManufactureRepository();
    }

    async createUser(client, role, data, userId) {
        try {
            let refId;
            const existingUser = await this.adminRepository.getUserByMobile(client, data.mobile_number);
            if (existingUser) {
                throw new CustomError("A user with this mobile number already exists", 409);
            }

            if (role === 'camp_lead') {

                 // Insert into camp_leads
                 const campLead = await this.adminRepository.addCampLead(client, {
                    ...data,
                    manufacturer_id: data.manufacturer_id
                  });

                // create new community
                const community = await this.adminRepository.createCommunity(client, {
                    campLeadId:campLead.id,
                    type: 'chow',
                    name: `${data.place}/${campLead.id}-community`
                });

                // Insert into farmers
                const farmer = await this.communityMgtRepository.onboardFarmer(client, {...data, community_id: community.id});
                refId = farmer.id;
            }

            if (role === 'manufacturer') {
                const muid=`ZEC_MCC_M/${uuidv4()}`;
                const manufacturer = await this.adminRepository.addManufacturer(client, {...data, muid}, userId);
                refId = manufacturer.id;
            }
          
            if (role === 'admin') {
                const admin = await this.adminRepository.addAdmin(client, data, userId);
                refId = admin.id;
            }

            const passwordHash = await bcrypt.hash(data?.password || DEFAULT_PASSWORD, SALT_ROUNDS);
            const user = await this.adminRepository.addUser(client, {
                mobile_number: data.mobile_number,
                password: passwordHash,
                role,
                ref_id: refId
            });

            return user;

        } catch (error) {
            console.error("Error in admin service:", error);
            throw error;
        }
    }

    async getManufacturers(client) {
        try {
            const manufacturers = await this.adminRepository.getManufacturers(client);
            return manufacturers;
        } catch(error) {
            console.error("Error in admin service:", error);
            throw error;
        }
    }

    async getDashboardDetails() {
        try {
            const details = await this.adminRepository.getDashBoardDetails();
            return {
                total_offsets: parseInt(details.total_offsets, 10),
                total_farmers: parseInt(details.total_farmers, 10),
                total_cattles: parseInt(details.total_cattles, 10),
                total_campLeads: parseInt(details.total_campleads, 10)
              };
        } catch(error) {
            console.error("Error in admin service:", error);
            throw error;
        }
    }

    async getWeeklyOffsets () {
        try {
            const weeklyOffsets = await this.adminRepository.getWeeklyOffsets();
            return weeklyOffsets;
        } catch(error) {
            console.error("Error in admin service:", error);
            throw error;
        }
    }

    async getFarmersByMonth () {
        try {
            const farmers = await this.adminRepository.getFarmersByMonth();
            return farmers;
        } catch(error) {
            console.error("Error in admin service:", error);
            throw error;
        }
    }

    async getPotentialOffsets () {
        try {
            const report = await this.adminRepository.getPotentialOffsets();
            return report;
        } catch(error) {
            console.error("Error in admin service:", error);
            throw error;
        }
    }

    async getAllOffsets (queryParams) {
        try {
            const page = parseInt(queryParams.page, 10) || 1;
            const limit = parseInt(queryParams.limit, 10) || 50;
            const offset = (page - 1) * limit;
            const totalCount = await this.adminRepository.countTotalOffsets();
            const offsets = await this.adminRepository.getAllOffsets(limit, offset);

            return {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                offsets
            };
        } catch(error) {
            console.error("Error in admin service:", error);
            throw error;
        }
    }

    async getFractionalOffsetById (offsetId) {
        try {
            const fos = await this.adminRepository.getFractionalOffsetById(offsetId);
            return fos
        } catch(error) {
            console.error("Error in admin service:", error);
            throw error;
        }
    }

    async exportFractionalOffsetId(offsetId) {
        try {
            const fos = await this.adminRepository.getFractionalOffsetById(offsetId);
            if (!fos.length) {
                throw new CustomError('No data found for this offset ID', 404);
            }
        
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(`Fractional Offset ${offsetId}`);
        
            // Define columns in same order as your query
            worksheet.columns = [
                { header: 'ID', key: 'id' },
                { header: 'Farmer ID', key: 'farmer_id' },
                { header: 'Farmer Custom ID', key: 'farmer_custom_id' },
                { header: 'Farmer Name', key: 'farmer_name' },
                { header: 'Aadhar', key: 'aadhar' },
                { header: 'Mobile Number', key: 'mobile_number' },
                { header: 'Place', key: 'place' },
                { header: 'State', key: 'state' },
                { header: 'District', key: 'district' },
                { header: 'Pincode', key: 'pincode' },
                { header: 'Farmer Lat', key: 'farmer_lat' },
                { header: 'Farmer Lng', key: 'farmer_lng' },
                { header: 'Onboarding Date', key: 'farmer_onboarding_date' },
                { header: 'Cattle ID', key: 'cattle_id' },
                { header: 'Feed Batch ID', key: 'feed_batch_id' },
                { header: 'Camp Lead ID', key: 'camp_lead_custom_id' },
                { header: 'Camp Lead Lat', key: 'camp_lead_lat' },
                { header: 'Camp Lead Lng', key: 'camp_lead_lng' },
                { header: 'Log Date', key: 'log_date' },
                { header: 'Feed Given', key: 'feed_given' },
                { header: 'Fractional Offset ID', key: 'fractional_offset_id' },
                { header: 'Verification Date', key: 'verification_date' },
                { header: 'Verification ID', key: 'verification_id' },
                { header: 'Offset ID', key: 'offset_id' },
                { header: 'Verified Lat', key: 'verified_lat' },
                { header: 'Verified Lng', key: 'verified_lng' },
                { header: 'Verification Pic', key: 'verification_pic' },
                { header: 'Note', key: 'note' },
            ];
        
            // Format header row
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).alignment = { horizontal: 'center' };
        
            // Add data rows
            fos.forEach((row) => {
                worksheet.addRow({
                ...row,
                farmer_onboarding_date: this.formatExcelDate(row.farmer_onboarding_date),
                log_date: this.formatExcelDate(row.log_date),
                verification_date: this.formatExcelDate(row.verification_date),
                note: row.note || '-',
                });
            });
        
            // Format date columns for Excel sorting
            ['farmer_onboarding_date', 'log_date', 'verification_date'].forEach((key) => {
                const col = worksheet.getColumn(key);
                col.numFmt = 'dd-mm-yyyy';
            });
        
            // Auto-width columns
            worksheet.columns.forEach((col) => {
                if (['farmer_onboarding_date', 'log_date', 'verification_date'].includes(col.key)) {
                  col.width = 20; // fixed width for dates
                } else {
                  let maxLength = 12;
                  col.eachCell({ includeEmpty: true }, (cell) => {
                    const len = cell.value ? cell.value.toString().length : 0;
                    if (len > maxLength) maxLength = len;
                  });
                  col.width = maxLength + 2;
                }
              });
        
            // Return Excel buffer
            const buffer = await workbook.xlsx.writeBuffer();
            return buffer;
    
        } catch (error) {
            console.error('Error in admin service export function:', error);
            throw error;
        }
    }

    // Helper to format dates as dd-mm-yyyy
    formatExcelDate(dateStr) {
        return dateStr ? new Date(dateStr) : null;
    }

    async exportFarmers() {
        try {
            const farmers = await this.adminRepository.getFarmers();
            if (!farmers.length) {
                throw new CustomError('No data found', 404);
            }
    
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Farmers');
    
            // Define columns in same order as query
            worksheet.columns = [
                { header: 'Farmer ID', key: 'farmer_id' },
                { header: 'Farmer Custom ID', key: 'farmer_custom_id' },
                { header: 'Name', key: 'name' },
                { header: 'Mobile Number', key: 'mobile_number' },
                { header: 'Place', key: 'place' },
                { header: 'State', key: 'state' },
                { header: 'District', key: 'district' },
                { header: 'Pincode', key: 'pincode' },
                { header: 'Aadhar', key: 'aadhar' },
                { header: 'Latitude', key: 'lat' },
                { header: 'Longitude', key: 'lng' },
                { header: 'Cattle Count', key: 'cattle_count' },
                { header: 'Onboarded Date', key: 'created_at' },
            ];
    
            // Format header row
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).alignment = { horizontal: 'center' };
    
            // Add data rows
            farmers.forEach((row) => {
                worksheet.addRow({
                    ...row,
                    created_at: this.formatExcelDate(row.created_at),
                });
            });
    
            // Format date column
            worksheet.getColumn('created_at').numFmt = 'dd-mm-yyyy';
    
            // Auto-width columns
            worksheet.columns.forEach((col) => {
                if (['created_at'].includes(col.key)) {
                    col.width = 20; // fixed width for date
                } else {
                    let maxLength = 12;
                    col.eachCell({ includeEmpty: true }, (cell) => {
                        const len = cell.value ? cell.value.toString().length : 0;
                        if (len > maxLength) maxLength = len;
                    });
                    col.width = maxLength + 2;
                }
            });
    
            // Return Excel buffer
            const buffer = await workbook.xlsx.writeBuffer();
            return buffer;
    
        } catch (error) {
            console.error('Error in admin service export function:', error);
            throw error;
        }
    }

    async exportCampleads() {
        try {
            const campleads = await this.adminRepository.getCampLeads();
            if (!campleads.length) {
                throw new CustomError('No data found', 404);
            }
    
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Camp Leads");
    
            // Define columns (same order as your query)
            worksheet.columns = [
                { header: 'Camp Lead ID', key: 'camp_lead_id' },
                { header: 'Camp Lead Custom ID', key: 'camp_lead_custom_id' },
                { header: 'Name', key: 'name' },
                { header: 'Mobile Number', key: 'mobile_number' },
                { header: 'Place', key: 'place' },
                { header: 'State', key: 'state' },
                { header: 'District', key: 'district' },
                { header: 'Pincode', key: 'pincode' },
                { header: 'Aadhar', key: 'aadhar' },
                { header: 'Latitude', key: 'lat' },
                { header: 'Longitude', key: 'lng' },
                { header: 'Cattle Count', key: 'cattle_count' },
                { header: 'Onboarded Date', key: 'created_at' },
            ];
    
            // Format header row
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).alignment = { horizontal: 'center' };
    
            // Add data rows
            campleads.forEach((row) => {
                worksheet.addRow({
                    ...row,
                    created_at: this.formatExcelDate(row.created_at),
                });
            });
    
            // Format date columns for Excel sorting
            ['created_at'].forEach((key) => {
                const col = worksheet.getColumn(key);
                col.numFmt = 'dd-mm-yyyy';
            });
    
            // Auto-width columns
            worksheet.columns.forEach((col) => {
                if (['created_at'].includes(col.key)) {
                    col.width = 20; // fixed width for dates
                } else {
                    let maxLength = 12;
                    col.eachCell({ includeEmpty: true }, (cell) => {
                        const len = cell.value ? cell.value.toString().length : 0;
                        if (len > maxLength) maxLength = len;
                    });
                    col.width = maxLength + 2;
                }
            });
    
            // Return Excel buffer
            const buffer = await workbook.xlsx.writeBuffer();
            return buffer;
    
        } catch (error) {
            console.error('Error in admin service export function:', error);
            throw error;
        }
    }
    

    async getAllCampLeads(queryParams) {
        const page = parseInt(queryParams.page, 10) || 1;
        const limit = parseInt(queryParams.limit, 10) || 50;
        const offset = (page - 1) * limit;
    
        const totalCount = await this.adminRepository.countCampLeads();
        const campLeads = await this.adminRepository.getAllCampLeads(limit, offset);
    
        return {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            campLeads
        };
    }
    
    async getUsers(queryParams) {
        try {
            const page = parseInt(queryParams.page, 10) || 1;
            const limit = parseInt(queryParams.limit, 10) || 50;
            const offset = (page - 1) * limit;
            const rolesFilter = this.buildRoleFilter(queryParams.role);
            const searchTerm = queryParams.search ? queryParams.search.trim() : null;
            const totalCount = await this.adminRepository.countUsers(rolesFilter, searchTerm);
            const users = await this.adminRepository.getAllUsers(limit, offset, rolesFilter, searchTerm);
    
            return {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                users
            };
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    }
    
    buildRoleFilter(roleParam) {
        const roles = roleParam
            ? roleParam
                .split(',')
                .map((role) => role.trim().toLowerCase())
                .filter(Boolean)
            : DEFAULT_USER_ROLES;
    
        const validRoles = roles.filter((role) => ALLOWED_ROLES.includes(role));
        if (!validRoles.length) {
            throw new CustomError("Invalid role filter supplied", 400);
        }
        return validRoles;
    }
    
    async updateCamplead(client, payload) {
        try {
            console.log("=====PAYLOAD", payload);
    
            const { camplead_id, farmer_id, password, mobile_number, ...campleadData } = payload;
            campleadData.mobile_number = payload.mobile_number;

            if(mobile_number) {
                const existingUser = await this.adminRepository.findUserByMobile(client, mobile_number);
                if (existingUser && existingUser.ref_id !== farmer_id) {
                    throw new CustomError("Mobile number already exists. Please use a different one.", 400);
                }
            }
    
            // 1. Update camp_leads table
            const updatedCampLead = await this.adminRepository.updateCampLead(
                client,
                camplead_id,
                campleadData
            );
    
            // 2. Update farmers table (mirror data)
            const farmerData = {
                name: campleadData.name,
                mobile_number: mobile_number,
                place: campleadData.place,
                state: campleadData.state,
                district: campleadData.district,
                pincode: campleadData.pincode,
                aadhar: campleadData.aadhar,
                cattle_count: campleadData.cattle_count
            };
    
            await this.adminRepository.updateFarmer(client, farmer_id, farmerData);
    
            // 3. Prepare user update (mobile/password)
            const userUpdateData = {};
            if (mobile_number) {
                userUpdateData.mobile_number = mobile_number;
            }
    
            if (password) {
                userUpdateData.password = await bcrypt.hash(password, SALT_ROUNDS);
            }
    
            if (Object.keys(userUpdateData).length > 0) {
                await this.adminRepository.updateUserByRefId(client, farmer_id, userUpdateData);
            }
    
            return updatedCampLead;
        } catch (error) {
            console.error("Error updating camp lead:", error.message);
            throw error;
        }
    }

    async updateUser(client, userId, payload) {
        try {
            // Check if user exists
            const existingUser = await this.adminRepository.getUserById(client, userId);
            if (!existingUser) {
                throw new CustomError("User not found", 404);
            }

            const { name, mobile_number, password, role } = payload;
            const userRole = existingUser.role;
            const refId = existingUser.ref_id;

            // Validate role if provided (should match existing role)
            if (role && role !== userRole) {
                throw new CustomError("Cannot change user role through this endpoint", 400);
            }

            // Prepare user table updates
            const userUpdateData = {};

            // Check mobile number uniqueness if it's being updated
            if (mobile_number) {
                const userWithMobile = await this.adminRepository.findUserByMobile(client, mobile_number);
                if (userWithMobile && userWithMobile.id !== parseInt(userId)) {
                    throw new CustomError("Mobile number already exists. Please use a different one.", 400);
                }
                userUpdateData.mobile_number = mobile_number;
            }

            // Hash password if it's being updated
            if (password) {
                userUpdateData.password = await bcrypt.hash(password, SALT_ROUNDS);
            }

            // Update entity table based on role
            if (name) {
                if (!refId) {
                    throw new CustomError(`User ref_id is missing. Cannot update ${userRole} entity.`, 400);
                }

                switch (userRole) {
                    case 'farmer':
                    case 'auditor':
                        // Update farmers table
                        const farmer = await this.adminRepository.getFarmerByRefId(client, refId);
                        if (!farmer) {
                            throw new CustomError("Farmer not found", 404);
                        }
                        await this.adminRepository.updateFarmerName(client, refId, name);
                        if (mobile_number) {
                            await this.adminRepository.updateFarmerMobile(client, refId, mobile_number);
                        }
                        break;

                    case 'camp_lead':
                        // Update both farmers and camp_leads tables
                        // Get farmer to find camp lead
                        const campLeadFarmer = await this.adminRepository.getFarmerByRefId(client, refId);
                        if (!campLeadFarmer) {
                            throw new CustomError("Farmer not found for camp lead", 404);
                        }

                        // Find camp lead by current farmer mobile number (before update)
                        const campLead = await this.adminRepository.getCampLeadByFarmerMobile(
                            client, 
                            campLeadFarmer.mobile_number
                        );
                        if (!campLead) {
                            throw new CustomError("Camp lead not found for farmer", 404);
                        }

                        // Update farmer
                        await this.adminRepository.updateFarmerName(client, refId, name);
                        if (mobile_number) {
                            await this.adminRepository.updateFarmerMobile(client, refId, mobile_number);
                        }

                        // Update camp lead
                        await this.adminRepository.updateCampLeadName(client, campLead.id, name);
                        if (mobile_number) {
                            await this.adminRepository.updateCampLeadMobile(client, campLead.id, mobile_number);
                        }
                        break;

                    case 'manufacturer':
                        // Update manufacturers table
                        // Get current manufacturer data
                        const manufacturer = await this.manufactureRepository.getManufacturerById(client, refId);
                        if (!manufacturer) {
                            throw new CustomError("Manufacturer not found", 404);
                        }
                        
                        const manufacturerUpdateData = {
                            name: name,
                            location: manufacturer.location,
                            muid: manufacturer.muid
                        };
                        await this.manufactureRepository.updateManufacturer(client, refId, manufacturerUpdateData);
                        break;

                    case 'admin':
                        // Update admins table
                        const admin = await this.adminRepository.getAdminByRefId(client, refId);
                        if (!admin) {
                            throw new CustomError("Admin not found", 404);
                        }
                        await this.adminRepository.updateAdmin(client, refId, { name });
                        break;

                    default:
                        throw new CustomError(`Update not supported for role: ${userRole}`, 400);
                }
            } else if (mobile_number && (userRole === 'farmer' || userRole === 'auditor' || userRole === 'camp_lead')) {
                // If only mobile_number is being updated for farmer/auditor/camp_lead, update entity table
                if (refId) {
                    if (userRole === 'camp_lead') {
                        const farmer = await this.adminRepository.getFarmerByRefId(client, refId);
                        if (!farmer) {
                            throw new CustomError("Farmer not found for camp lead", 404);
                        }
                        // Find camp lead by current farmer mobile number
                        const campLead = await this.adminRepository.getCampLeadByFarmerMobile(client, farmer.mobile_number);
                        if (!campLead) {
                            throw new CustomError("Camp lead not found for farmer", 404);
                        }
                        // Update both farmer and camp lead mobile numbers
                        await this.adminRepository.updateFarmerMobile(client, refId, mobile_number);
                        await this.adminRepository.updateCampLeadMobile(client, campLead.id, mobile_number);
                    } else {
                        await this.adminRepository.updateFarmerMobile(client, refId, mobile_number);
                    }
                }
            }

            // Update users table
            if (Object.keys(userUpdateData).length > 0) {
                await this.adminRepository.updateUserById(client, userId, userUpdateData);
            }

            // Return updated user
            const updatedUser = await this.adminRepository.getUserById(client, userId);
            return updatedUser;
        } catch (error) {
            console.error("Error updating user:", error.message);
            throw error;
        }
    }
}

module.exports = AdminService;
