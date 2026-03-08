const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Watch shared folder for i18n
config.watchFolders = [path.resolve(__dirname, '../shared')];
config.resolver.extraNodeModules = {
  shared: path.resolve(__dirname, '../shared'),
};

const projectRoot = __dirname;
const sharedRoot = path.resolve(projectRoot, '../shared');

// Use axios browser build (avoids Node 'crypto' import in React Native)
// Resolve shared/* to ../shared/*
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'axios' || moduleName.startsWith('axios/')) {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'node_modules/axios/dist/browser/axios.cjs'),
    };
  }
  if (moduleName.startsWith('shared/') || moduleName === 'shared') {
    const targetPath = moduleName === 'shared' ? sharedRoot : path.join(sharedRoot, moduleName.replace('shared/', ''));
    return {
      type: 'sourceFile',
      filePath: targetPath,
    };
  }
  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
