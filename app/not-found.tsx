export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "3rem 1.5rem",
      }}
    >
      <div
        style={{
          fontFamily: "DM Serif Display, Georgia, serif",
          fontSize: "6rem",
          lineHeight: 1,
          color: "var(--accent-mint)",
          textShadow: "0 0 40px var(--accent-mint-glow)",
          marginBottom: "1.5rem",
          opacity: 0.8,
        }}
        aria-hidden="true"
      >
        404
      </div>

      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          letterSpacing: "-0.025em",
          marginBottom: "0.75rem",
        }}
      >
        Page not found
      </h1>

      <p
        style={{
          color: "var(--text-muted)",
          maxWidth: "360px",
          marginBottom: "2rem",
          lineHeight: 1.6,
        }}
      >
        This page doesn&apos;t exist — but your path to debt freedom does.
      </p>

      <a href="/" className="btn-primary">
        Back to DebtZero
      </a>
    </div>
  );
}
