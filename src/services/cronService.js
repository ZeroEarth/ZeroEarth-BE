const { CommunityMgtRepository } = require("../repositories");
const withTransaction = require("../utils/withTransaction");

class CronService {
    constructor() {
        this.communityMgtRepository = new CommunityMgtRepository();
    }

    async initiate() {
        const response = await withTransaction(async (client) => {

            return await this.sendDailyCommunityMessages(client);
        })

        return response;
    }

    async sendDailyCommunityMessages(client) {
        const chowCommunities = await this.communityMgtRepository.getCHOWCommunities(client);
        if (!chowCommunities.length) return;
      
        // 1. Construct rows of values
        const messages = chowCommunities.map((c) => [
          c.id,                       // community_id
          'camp_lead',                // sender_type
          c.camp_lead_id,             // sender_id
          'daily_feed',               // type
          JSON.stringify({ content: 'Have you feed CHOW today?' }), // message
        ]);
      
        // 2. Flatten all values into a single array
        const flatValues = messages.flat();
      
        // 3. Generate parameter placeholders: ($1, $2, $3, $4, $5), ...
        const placeholders = this.generatePlaceholders(messages.length, 5);
      
        // 4. Pass query string and values to repository
        return this.communityMgtRepository.insertSystemGeneratedDailyFeedMessages(client, placeholders, flatValues);
    }

    // Helper to generate SQL parameter placeholders like: ($1, $2, $3, $4, $5), ($6, ..., $10), ...
    generatePlaceholders(rowCount, columnsPerRow) {
        return Array.from({ length: rowCount }, (_, rowIndex) => {
          const base = rowIndex * columnsPerRow;
          const rowPlaceholders = Array.from({ length: columnsPerRow }, (_, colIndex) => `$${base + colIndex + 1}`);
          return `(${rowPlaceholders.join(', ')})`;
        }).join(', ');
    }
  
      
}

module.exports = CronService;