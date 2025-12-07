const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const boolFromEnv = (value, defaultValue = true) => {
  if (value === undefined || value === null) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(value.toString().toLowerCase());
};

const config = {
  appName: process.env.APP_NAME || 'Unity Game Backend',
  nodeEnv: process.env.NODE_ENV || process.env.nodeEnv || 'development',
  port: Number(process.env.PORT || 8080),
  version: process.env.BACKEND_VERSION || process.env.version || 'local',
  mongoUri: process.env.MONGO_URI || process.env.mongoUri || '',
  mongoDbName: process.env.MONGO_DB_NAME || 'game_backend',
  urls: {
    backendPublicUrl: process.env.BACKEND_PUBLIC_URL || '',
    frontendPublicUrl: process.env.FRONTEND_PUBLIC_URL || ''
  },
  shared: {
    version: process.env.SHARED_VERSION || process.env.sharedVersion || 'LIVE',
    type: process.env.SHARED_TYPE || process.env.sharedType || 'DEFAULT'
  },
  secrets: {
    apiSecret: process.env.API_SECRET || '',
    jwtSecret: process.env.JWT_SECRET || process.env.API_SECRET || process.env.LeagueSalt || '',
    leagueSalt: process.env.LEAGUE_SALT || process.env.LeagueSalt || '',
    leagueLoginSalt: process.env.LEAGUE_LOGIN_SALT || process.env.LeagueLoginSalt || '',
    loginSalt: process.env.LOGIN_SALT || process.env.LoginSalt || '',
    salt: process.env.SALT || process.env.Salt || ''
  },
  flags: {
    seedSharedDataOnStart: boolFromEnv(process.env.SEED_SHARED_DATA, true)
  }
};

function assertConfig(requiredKeys = []) {
  const missing = requiredKeys.filter((key) => {
    const value = key.split('.').reduce((acc, curr) => (acc ? acc[curr] : undefined), config);
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    console.warn('[config] Missing required env vars:', missing.join(', '));
  }

  return missing;
}

module.exports = {
  ...config,
  assertConfig
};
