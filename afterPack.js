// After pack hook for electron-builder
// Just log the build info - electron-builder handles native modules
exports.default = async function(context) {
  const platform = context.electronPlatformName;
  const arch = context.arch;

  console.log(`\n=== After Pack Hook ===`);
  console.log(`Built for: ${platform}-${arch}`);
  console.log(`App directory: ${context.appOutDir}`);
  console.log('=== After Pack Hook Complete ===\n');
};
