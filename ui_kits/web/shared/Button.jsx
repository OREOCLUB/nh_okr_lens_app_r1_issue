function Button({ variant = "primary", size = "md", children, leftIcon, rightIcon, onClick, disabled }) {
  const base = {
    fontFamily: "var(--font-sans)",
    fontWeight: 600,
    borderRadius: 10,
    border: "1px solid transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    lineHeight: 1,
    letterSpacing: "-0.005em",
    transition: "background 140ms ease-out, border-color 140ms ease-out, box-shadow 140ms ease-out",
    opacity: disabled ? 0.42 : 1,
  };
  const sizes = {
    sm: { fontSize: 12.5, padding: "7px 12px" },
    md: { fontSize: 13.5, padding: "10px 16px" },
    lg: { fontSize: 15, padding: "12px 22px" },
  };
  const variants = {
    primary:   { background: "#3B5BDB", color: "#fff", boxShadow: "0 1px 2px rgba(31,42,74,.08)" },
    secondary: { background: "#fff", color: "#1F2A4A", borderColor: "#C8CFDF" },
    ghost:     { background: "transparent", color: "#3A4565" },
    danger:    { background: "#fff", color: "#D14343", borderColor: "#FFD4D4" },
    success:   { background: "#2F9E5E", color: "#fff" },
    ai:        { background: "#F1F4FD", color: "#213A8C", borderColor: "#C5D0F7" },
  };
  const [hover, setHover] = React.useState(false);
  const hoverStyles = {
    primary:   { background: "#2C49B8" },
    secondary: { background: "#F4F7FB" },
    ghost:     { background: "#F4F7FB" },
    danger:    { background: "#FFF0F0" },
    success:   { background: "#268F52" },
    ai:        { background: "#E5EBFB" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...sizes[size], ...variants[variant], ...(hover ? hoverStyles[variant] : {}) }}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
window.Button = Button;
