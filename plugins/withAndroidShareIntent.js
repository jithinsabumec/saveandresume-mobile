const fs = require('fs');
const path = require('path');
const {
  AndroidConfig,
  withAndroidManifest,
  withMainActivity,
  withMainApplication,
  withDangerousMod
} = require('@expo/config-plugins');

const SHARE_PACKAGE = 'com.timestampsaver.share';

function addUniqueImport(source, importLine) {
  if (source.includes(importLine)) {
    return source;
  }

  const packageMatch = source.match(/package\s+[\w.]+\n?/);
  if (!packageMatch) {
    return source;
  }

  const idx = packageMatch.index + packageMatch[0].length;
  return `${source.slice(0, idx)}\n${importLine}\n${source.slice(idx)}`;
}

function injectJavaOnCreate(source) {
  if (source.includes('ShareIntentBridge.handleIntent(getIntent());')) {
    return source;
  }

  return source.replace(
    /super\.onCreate\((savedInstanceState|null)\);/,
    (match) => `${match}\n    ShareIntentBridge.handleIntent(getIntent());`
  );
}

function injectJavaOnNewIntent(source) {
  if (source.includes('ShareIntentBridge.handleIntent(intent);')) {
    return source;
  }

  if (source.includes('public void onNewIntent(Intent intent)')) {
    return source.replace(
      /setIntent\(intent\);/,
      'setIntent(intent);\n    ShareIntentBridge.handleIntent(intent);'
    );
  }

  return source.replace(
    /}\s*$/,
    `\n  @Override\n  public void onNewIntent(Intent intent) {\n    super.onNewIntent(intent);\n    setIntent(intent);\n    ShareIntentBridge.handleIntent(intent);\n  }\n}\n`
  );
}

function injectKotlinOnCreate(source) {
  if (source.includes('ShareIntentBridge.handleIntent(intent)')) {
    return source;
  }

  return source.replace(
    /super\.onCreate\((null|savedInstanceState)\)/,
    (match) => `${match}\n    ShareIntentBridge.handleIntent(intent)`
  );
}

function injectKotlinOnNewIntent(source) {
  if (source.includes('override fun onNewIntent(intent: Intent?)')) {
    return source;
  }

  return source.replace(
    /}\s*$/,
    `\n  override fun onNewIntent(intent: Intent?) {\n    super.onNewIntent(intent)\n    if (intent != null) {\n      setIntent(intent)\n      ShareIntentBridge.handleIntent(intent)\n    }\n  }\n}\n`
  );
}

function injectJavaPackageRegistration(source) {
  if (source.includes('new ShareIntentPackage()')) {
    return source;
  }

  if (source.includes('new PackageList(this).getPackages();')) {
    return source.replace(
      /List<ReactPackage> packages = new PackageList\(this\)\.getPackages\(\);/,
      'List<ReactPackage> packages = new PackageList(this).getPackages();\n      packages.add(new ShareIntentPackage());'
    );
  }

  return source;
}

function injectKotlinPackageRegistration(source) {
  if (source.includes('packages.add(ShareIntentPackage())')) {
    return source;
  }

  return source.replace(
    /val packages = PackageList\(this\)\.packages/,
    'val packages = PackageList(this).packages\n            packages.add(ShareIntentPackage())'
  );
}

function ensureManifestIntentFilter(manifest) {
  const mainApp = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(mainApp);
  const intentFilters = mainActivity['intent-filter'] || [];

  const hasShareFilter = intentFilters.some((filter) => {
    const actions = filter.action || [];
    const data = filter.data || [];
    return actions.some((a) => a.$['android:name'] === 'android.intent.action.SEND')
      && data.some((d) => d.$['android:mimeType'] === 'text/plain');
  });

  if (hasShareFilter) {
    return manifest;
  }

  intentFilters.push({
    action: [{ $: { 'android:name': 'android.intent.action.SEND' } }],
    category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
    data: [{ $: { 'android:mimeType': 'text/plain' } }]
  });

  mainActivity['intent-filter'] = intentFilters;
  return manifest;
}

function copyShareSources(projectRoot) {
  const srcDir = path.join(projectRoot, 'plugins', 'android-share');
  const destDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'java', ...SHARE_PACKAGE.split('.'));

  fs.mkdirSync(destDir, { recursive: true });

  ['ShareIntentBridge.java', 'ShareIntentModule.java', 'ShareIntentPackage.java'].forEach((file) => {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  });
}

module.exports = function withAndroidShareIntent(config) {
  config = withAndroidManifest(config, (mod) => {
    mod.modResults = ensureManifestIntentFilter(mod.modResults);
    return mod;
  });

  config = withMainActivity(config, (mod) => {
    let contents = mod.modResults.contents;
    const isKotlin = mod.modResults.language === 'kt';

    if (isKotlin) {
      contents = addUniqueImport(contents, 'import android.content.Intent');
      contents = addUniqueImport(contents, `import ${SHARE_PACKAGE}.ShareIntentBridge`);
      contents = injectKotlinOnCreate(contents);
      contents = injectKotlinOnNewIntent(contents);
    } else {
      contents = addUniqueImport(contents, 'import android.content.Intent;');
      contents = addUniqueImport(contents, `import ${SHARE_PACKAGE}.ShareIntentBridge;`);
      contents = injectJavaOnCreate(contents);
      contents = injectJavaOnNewIntent(contents);
    }

    mod.modResults.contents = contents;
    return mod;
  });

  config = withMainApplication(config, (mod) => {
    let contents = mod.modResults.contents;
    const isKotlin = mod.modResults.language === 'kt';

    if (isKotlin) {
      contents = addUniqueImport(contents, `import ${SHARE_PACKAGE}.ShareIntentPackage`);
      contents = injectKotlinPackageRegistration(contents);
    } else {
      contents = addUniqueImport(contents, `import ${SHARE_PACKAGE}.ShareIntentPackage;`);
      contents = injectJavaPackageRegistration(contents);
    }

    mod.modResults.contents = contents;
    return mod;
  });

  config = withDangerousMod(config, [
    'android',
    async (mod) => {
      copyShareSources(mod.modRequest.projectRoot);
      return mod;
    }
  ]);

  return config;
};
