import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Client SQLite natif : à ne pas empaqueter.
  serverExternalPackages: ["@libsql/client", "libsql"],
};

export default nextConfig;
