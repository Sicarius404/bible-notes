const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

// Support for pnpm workspace packages
const monorepoPackages = {
  '@bible-notes/shared': path.resolve(__dirname, '../../packages/shared'),
  '@bible-notes/pocketbase-client': path.resolve(__dirname, '../../packages/pocketbase-client'),
}

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...monorepoPackages,
}

config.watchFolders = [
  path.resolve(__dirname, '../../packages/shared'),
  path.resolve(__dirname, '../../packages/pocketbase-client'),
]

module.exports = config
