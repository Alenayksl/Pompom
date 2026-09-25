import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#6e8b5b",
          borderRadius: 16,
          color: "#f7f3e9",
          display: "flex",
          fontFamily: "sans-serif",
          fontSize: 38,
          fontWeight: 700,
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        p
      </div>
    ),
    size,
  );
}