const express = require('express');

const {authorize, validateUserCommunityAccess} = require('../../middlewares');
const { validationMiddleware }  = require("../../middlewares");
const {respondMessageSchema, feedDistributionSchemas} = require("../../validations/messageSchemas");
const {farmerOnboardingSchema, offsetVerificationSchema, feedDistributionSchema, feedConfirmSchema} = require("../../validations/communityMgtSchemas");
const communityMgtController = require("../../controllers/communityMgtController");
const messageController = require("../../controllers/messageController");
const offsetVerificationController = require("../../controllers/offsetVerificationController");



const router = express.Router();

// farmer onboarding
router.post('/:community_id/farmers', [authorize(['camp_lead']), validateUserCommunityAccess, validationMiddleware(farmerOnboardingSchema)], communityMgtController.onboardFarmer);
router.put('/:community_id/farmers/:farmer_id', [authorize(['camp_lead']), validateUserCommunityAccess, validationMiddleware(farmerOnboardingSchema)], communityMgtController.updateFarmer);
router.get('/:community_id/farmers', [authorize(['camp_lead']), validateUserCommunityAccess], communityMgtController.getFarmers);

//batch manufacturer verification by camplead
router.get('/batches/latest', [authorize(['camp_lead'])], communityMgtController.getLatestBatchDetailsAssigned);
router.put('/batches/:batch_id', [authorize(['camp_lead'])], communityMgtController.verifyBatchAssigned);

//get Farmers list for campleads in feed details
router.get('/:community_id/farmers/batches/:batch_no', [authorize(['camp_lead'])], communityMgtController.getFarmersListForFeedDistribution);
router.post('/:community_id/farmers/:farmer_id/feed-distribution', [authorize(['camp_lead']), validationMiddleware(feedDistributionSchema)], communityMgtController.sendFeedDistribution);

//farmer verification of latest batch assigned
router.get('/:community_id/farmers/latest-feed-distribution', [authorize(['farmer', 'camp_lead'])],validateUserCommunityAccess, communityMgtController.getLatestFeedDistribution);
router.post('/:community_id/farmers/feed-distribution/confirm', [authorize(['farmer','camp_lead']),validateUserCommunityAccess, validationMiddleware(feedConfirmSchema)], communityMgtController.confirmFeedDistribution);

// messages
router.get('/:community_id/messages/latest-daily-feed', [authorize(['camp_lead', 'farmer']),validateUserCommunityAccess], messageController.getLatestDailyFeedMessage);
router.get('/:community_id/messages', [authorize(['camp_lead', 'farmer']), validateUserCommunityAccess], messageController.getCommunityMessages);
// router.post('/:community_id/messages', [authorize(['camp_lead']), validationMiddleware(feedDistributionSchemas), validateUserCommunityAccess], messageController.sendFeedDistributionMessage);
router.post('/:community_id/messages/:message_id/respond',[authorize(['camp_lead', 'farmer']), validationMiddleware(respondMessageSchema), validateUserCommunityAccess], messageController.updateFarmerResponse);

//Offset verifications
router.get('/:community_id/farmers/:farmer_id/offset-verifications', [authorize(['camp_lead']), validateUserCommunityAccess], offsetVerificationController.getOffsetVerificationList);
router.get('/:community_id/farmers/offset-verifications', [authorize(['camp_lead']), validateUserCommunityAccess], communityMgtController.getFarmersListForOffsetVerification);
router.put('/:community_id/farmers/:farmer_id/offset-verifications', [authorize(['camp_lead']), validateUserCommunityAccess, validationMiddleware(offsetVerificationSchema)], offsetVerificationController.confirmOffsetVerification);

module.exports = router;