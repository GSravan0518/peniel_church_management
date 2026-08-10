const User = require('../models/User');

/**
 * On Render, set:
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE, ADMIN_NAME
 * Optional:
 *   ADMIN_RESET_PASSWORD=true  → update password if user already exists
 *
 * After you can log in, remove ADMIN_RESET_PASSWORD (and ideally ADMIN_PASSWORD).
 */
async function ensureAdminFromEnv() {
  const email = String(process.env.ADMIN_EMAIL || '')
    .trim()
    .toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  const phone = String(process.env.ADMIN_PHONE || '').trim();
  const name = String(process.env.ADMIN_NAME || 'Admin').trim();
  const reset = String(process.env.ADMIN_RESET_PASSWORD || '').toLowerCase() === 'true';

  if (!email || !password || !phone) {
    return;
  }

  if (password.length < 6) {
    console.warn('ADMIN_PASSWORD is too short; skipping admin bootstrap.');
    return;
  }

  let user = await User.findOne({ email });

  if (!user) {
    const phoneDigits = User.digitsOnly(phone);
    const phoneTaken = await User.findOne({ phoneDigits });
    if (phoneTaken) {
      console.warn(
        `Admin bootstrap skipped: phone ${phone} already used by ${phoneTaken.email}`
      );
      return;
    }

    await User.create({
      name,
      email,
      phone,
      password,
      role: 'admin',
    });
    console.log(`Admin bootstrapped: ${email}`);
    return;
  }

  if (reset) {
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.role = 'admin';
    user.password = password;
    await user.save();
    console.log(`Admin password reset from env: ${email}`);
  }
}

module.exports = { ensureAdminFromEnv };
