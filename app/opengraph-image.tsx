import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Vivienda Match AI | Colsubsidio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to right, #0033a0, #0055ff)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          {/* Un placeholder para el logo */}
          <div
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "white",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "30px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#0033a0",
                borderRadius: "50%",
              }}
            />
          </div>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "white",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Vivienda Match AI
          </h1>
        </div>
        <p
          style={{
            fontSize: "36px",
            color: "#e0f2fe",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
            fontWeight: "normal",
          }}
        >
          Perfilamiento inteligente y recomendación personalizada de vivienda
        </p>
        <div
          style={{
            marginTop: "60px",
            padding: "20px 40px",
            backgroundColor: "white",
            color: "#0033a0",
            fontSize: "28px",
            fontWeight: "bold",
            borderRadius: "40px",
          }}
        >
          Con el respaldo de Colsubsidio
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
