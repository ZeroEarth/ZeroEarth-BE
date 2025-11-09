const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const { AuthRepository } = require("../repositories");
const { JWT_SECRET } = require("../config/serverConfig");
const CustomError = require("../utils/customError");

class AuthService {
    constructor() {
        this.authRepository = new AuthRepository();
    }

    async login(data) {
        try {
            // const { mobile_number } = data;

            // const farmer = await this.authRepository.findFarmerByMobile(mobile_number);

            // if (!farmer) {
            //     throw new CustomError("Mobile number not found", 404);
            // }

            // const isCampLead = await this.authRepository.isCampLeadOfCommunity(
            //     farmer.camp_lead_id,
            //     mobile_number
            // );

            // const role = isCampLead ? "camp_lead" : "farmer";

            // const token = jwt.sign({ id: farmer.id, role }, JWT_SECRET);

            // return {
            //     role,
            //     id: farmer.id,
            //     name: farmer.name,
            //     camp_lead_id: farmer.camp_lead_id,
            //     cattle_count: farmer.cattle_count,
            //     community_name: farmer.community_name,
            //     community_id: farmer.community_id,
            //     mobile_number: farmer.mobile_number,
            //     profile_pic: farmer.profile_pic,
            //     place: farmer.place,
            //     lat: farmer.lat,
            //     lng: farmer.lng,
            //     token,
            // };
            const { mobile_number, password } = data;
            const user = await this.authRepository.findUserByMobile(mobile_number);
            if (!user) {
                throw new CustomError("User not found", 404);
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new CustomError("Invalid credentials", 401);
            }

            let profile = {};
            switch (user.role) {
                case "farmer":
                    profile = await this.authRepository.getFarmerDetails(user.ref_id);
                    break;
                case "camp_lead":
                    profile = await this.authRepository.getFarmerDetails(user.ref_id);
                    break;
                case "manufacturer":
                    profile = await this.authRepository.getManufacturerDetails(user.ref_id);
                    break;
                case "admin":
                    profile = await this.authRepository.getAdminDetails(user.ref_id);
                    break;
                // Add more roles here as needed
                default:
                    throw new CustomError("Unsupported role", 400);
            }

            const tokenPayload = {
                id: user.ref_id,
                role: user.role,
                mobile_number: user.mobile_number,
                auth_id: user.id
            };
            if (user.role === "camp_lead" && profile.camp_lead_id) {
                tokenPayload.camp_lead_id = profile.camp_lead_id;
            }
            
            const token = jwt.sign(tokenPayload, JWT_SECRET);
            return {
                token,
                role: user.role,
                auth_id: user.id,
                mobile_number: user.mobile_number,
                ...profile,
            };

        } catch (error) {
            console.error("Error in auth service:", error);
            throw error;
        }
    }

    async updateTermsWithLocation(client, data) {
        try {
            const {lat, lng} = data;
            await this.authRepository.updateTermsWithLocation(client, data); 
            return {
                updated: true,
                lat,
                lng
            }
        } catch (error) {
            console.error("Error in auth service:", error);
            throw error;
        }
    }
}

module.exports = AuthService;