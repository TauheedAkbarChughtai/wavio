sed -i '' 's/assetExts.filter((ext) => ext !== "svg")/assetExts.filter((ext) => ext !== "svg").concat("wasm")/g' apps/mobile/metro.config.js
