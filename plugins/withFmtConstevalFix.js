const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo SDK 52 / React Native 0.76 vendors fmt 11.0.2, whose FMT_STRING
 * consteval checks fail to compile under Xcode 16+ / Apple clang 17+
 * ("call to consteval function ... is not a constant expression").
 *
 * This plugin injects a snippet into the generated Podfile's post_install
 * hook that flips fmt's consteval path off (FMT_USE_CONSTEVAL 0) after pods
 * are installed. It runs on every `pod install`, so the fix survives
 * `expo prebuild` and fresh clones.
 */
const MARKER = '[withFmtConstevalFix]';
const SNIPPET = `
    # ${MARKER} Disable fmt consteval (Xcode 16+/clang 17+ build fix).
    # The extracted fmt headers are read-only, so shell out to sed (writes a
    # temp file + renames) rather than File.write (fails with EACCES).
    fmt_base = "#{installer.sandbox.root}/fmt/include/fmt/base.h"
    if File.exist?(fmt_base) && File.read(fmt_base).include?("#  define FMT_USE_CONSTEVAL 1")
      system("chmod u+w '#{fmt_base}'; sed -i '' 's/#  define FMT_USE_CONSTEVAL 1/#  define FMT_USE_CONSTEVAL 0/g' '#{fmt_base}'")
      Pod::UI.puts "[withFmtConstevalFix] patched fmt base.h (FMT_USE_CONSTEVAL=0)"
    end
`;

module.exports = function withFmtConstevalFix(config) {
  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');
      if (!contents.includes(MARKER)) {
        contents = contents.replace(/post_install do \|installer\|\n/, (m) => m + SNIPPET + '\n');
        fs.writeFileSync(podfilePath, contents);
      }
      return cfg;
    },
  ]);
};
