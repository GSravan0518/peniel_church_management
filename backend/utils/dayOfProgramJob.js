const { ensureTodayProgramNotifications } = require('./time');

const INTERVAL_MS = Number(process.env.DAY_OF_NOTIFY_INTERVAL_MS) || 15 * 60 * 1000;

/**
 * Periodically create pastor notifications for programs scheduled today.
 * Also runs once when the server starts (after Mongo is connected).
 */
function startDayOfProgramNotifier() {
  const run = async () => {
    try {
      const { todays, created, todayKey } = await ensureTodayProgramNotifications();
      if (created.length > 0) {
        console.log(
          `Day-of notifications (${todayKey}): created ${created.length} for ${todays.length} program(s).`
        );
      }
    } catch (err) {
      console.error('Day-of program notifier error:', err.message);
    }
  };

  run();
  const timer = setInterval(run, INTERVAL_MS);
  if (typeof timer.unref === 'function') timer.unref();
  console.log(
    `Day-of program notifier started (every ${Math.round(INTERVAL_MS / 60000)} min, TZ=${process.env.CHURCH_TZ || 'Asia/Kolkata'}).`
  );
  return timer;
}

module.exports = { startDayOfProgramNotifier };
