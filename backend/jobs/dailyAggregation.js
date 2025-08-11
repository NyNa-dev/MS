// jobs/dailyAggregation.js
import cron from "node-cron";
import { DateTime } from "luxon";
import User from "../models/user.model.js";
import { generateDailyAnalyticsForDate } from "../services/analyticsService.js";

export default function scheduleDailyAnalytics(io, defaultTz = "Africa/Accra") {
  // runs every day at 00:00 in tz
  cron.schedule("0 0 * * *", async () => {
    const tz = defaultTz;
    const yesterday = DateTime.now().setZone(tz).minus({ days: 1 }).toFormat("yyyy-MM-dd");
    const users = await User.find({}, "_id timezone").lean();

    for (const u of users) {
      const userTz = u.timezone || tz;
      try {
        await generateDailyAnalyticsForDate(u._id, yesterday, userTz);
        // notify user via socket room (frontend should join room user:<userId>)
        io.to(`user:${u._id}`).emit("analytics_ready", { date: yesterday, userId: String(u._id) });
      } catch (e) {
        console.error("daily analytics failed for", u._id, e);
      }
    }
  }, { timezone: defaultTz });
}
