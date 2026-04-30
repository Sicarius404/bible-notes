const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Watch all workspace packages
config.watchFolders = [
  workspaceRoot,
]

// Resolve packages from both project root and workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// Support for pnpm workspace packages
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@bible-notes/shared': path.resolve(workspaceRoot, 'packages/shared'),
  '@bible-notes/pocketbase-client': path.resolve(workspaceRoot, 'packages/pocketbase-client'),
}

module.exports = config
