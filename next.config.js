/** @type {import('next').NextConfig} */

require("dotenv").config();
const nextConfig = {
  reactStrictMode: true,
  env: {
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
    GOOGLE_SERVICE_PRIVATE_KEY: process.env.GOOGLE_SERVICE_PRIVATE_KEY,
    GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
    SPREADSHEET_ID: process.env.SPREADSHEET_ID,
    SHEET_ID: process.env.SHEET_ID,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
      config.resolve.fallback.tls = false;
      config.resolve.fallback.net = false;
      config.resolve.fallback.child_process = false;
    }

    return config;
  },
  future: {
    webpack5: true,
  },
  fallback: {
    fs: false,
    tls: false,
    net: false,
    child_process: false,
  },
};

module.exports = nextConfig;
