const express = require("express");
const cron = require('node-cron');
const cors = require('cors');
const morgan = require('morgan');

const { PORT } = require("./config/serverConfig");
const ApiRoutes = require('./routes/index');
const { CronService } = require('./services')

const setUpAndStartServer = async () => {

    //create the express object
    const app = express();

    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    app.use(morgan('dev'));
    app.use(cors());


    app.use('/api', ApiRoutes);
    
    // Health check
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', time: new Date().toISOString() });
    });

    // Handle unhandled routes (404)
    app.use((req, res, next) => {
        res.status(404).json({
            success: false,
            message: "Route not found",
            error: `Cannot ${req.method} ${req.originalUrl}`,
        });
    });

    // Global error handler
    app.use((error, req, res, next) => {
        res.status(error.status || 500);
        res.json({
            success: false,
            message: error.message || 'Internal Server Error',
            error: 'Something went wrong'
        });
    });

    app.listen(PORT, () => {
        console.log(`Server started at ${PORT}`);
        cron.schedule('0 0 * * *', async () => {
            try {
                console.log('[CRON] Triggering daily community messages...');
                const cronService = new CronService();
                await cronService.initiate();
                console.log('[CRON] Completed successfully.');
            } catch (err) {
                console.error('[CRON] Error while running daily community messages:', err);
            }
        }, {
            timezone: 'Asia/Kolkata'
        }); // runs everyday 12:00 AM IST
    })

}

setUpAndStartServer();