const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// NativeWind writes and owns `nativewind-env.d.ts` (its default
// typescriptEnvPath) — that is the file carrying the
// `/// <reference types="nativewind/types" />` line that makes `className`
// type-check on React Native components. It deliberately is NOT pointed at
// `expo-env.d.ts`: with `experiments.typedRoutes` disabled, `expo start`
// unconditionally deletes `expo-env.d.ts` and strips it from tsconfig#include
// on every launch (see @expo/cli startTypescriptTypeGeneration), which would
// silently take the NativeWind types down with it.
module.exports = withNativeWind(config, { input: './global.css' });
