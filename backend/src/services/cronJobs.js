import cron from 'node-cron';
import Task from "../models/Task.js"; 

const sendAlertMessage = (admin1, admin2, tasks) => {
    console.log(`Sending alerts to ${admin1} and ${admin2} for ${tasks.length} idle tasks.`);
};

const initCronJobs = () => {
    cron.schedule('0 * * * *', async () => {
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const idleTasks = await Task.find({
                status: { $nin: ['Done', 'Completed', 'Rejected'] },
                assignedToEmpId: { $nin: [null, ''] },
                $or: [
                    { lastWorkUpdateAt: null, assignedAt: { $lte: oneHourAgo } },
                    { lastWorkUpdateAt: { $lte: oneHourAgo } }
                ]
            });

            if (idleTasks.length > 0) {
                await Task.updateMany(
                    { _id: { $in: idleTasks.map((task) => task._id) } },
                    { updateAlertStatus: 'Missed', updateAlertedAt: new Date() }
                );
                sendAlertMessage("admin1@example.com", "admin2@example.com", idleTasks);
            }
        } catch (error) {
            console.error("Cron Job Error:", error);
        }
    });
    
    console.log("✅ Hourly Task Alert Cron Started");
};

// Change 'CronJobs' to 'initCronJobs' to match your function name
export default initCronJobs;
