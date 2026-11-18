import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // A short, shareable link to the CV. Temporary, so the PDF can be renamed later.
    return [{ source: "/cv", destination: "/sahan-perera-cv.pdf", permanent: false }];
  },
};

export default nextConfig;
