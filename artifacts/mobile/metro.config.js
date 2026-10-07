const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Local testing only: PDB_MOCK_BACKEND=1 swaps the Supabase client for an
// in-memory stand-in (src/services/__mock__/supabase.ts, which is not committed).
if (process.env.PDB_MOCK_BACKEND === "1") {
  const mock = path.resolve(__dirname, "src/services/__mock__/supabase.ts");
  const original = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) =>
    moduleName === "@/services/supabase"
      ? { type: "sourceFile", filePath: mock }
      : (original ?? context.resolveRequest)(context, moduleName, platform);
}

module.exports = config;
