import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "נקודות חניה",
    short_name: "נקודות חניה",
    description: "אפליקציית חניה מגיימת: דווחו איפה חניתם, צברו נקודות, והתחרו על מקום בלוח הדירוג.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef3ff",
    theme_color: "#7c5cff",
    lang: "he",
    dir: "rtl",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
