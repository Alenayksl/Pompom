import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "pomPom | Grow Plants While You Focus",
    short_name: "pomPom",
    description:
      "A gamified pomodoro timer where focused sessions help you grow virtual plants.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3e9",
    theme_color: "#6e8b5b",
    icons: [
      {
        src: "/icon",
        sizes: "64x64",
        type: "image/png",
      },
    ],
  };
}