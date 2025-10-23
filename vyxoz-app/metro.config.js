const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Simple blacklist for anonymous files
config.resolver.blacklistRE = /\<anonymous\>/;

module.exports = config;