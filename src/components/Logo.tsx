interface LogoProps {
  size?: "sm" | "md" | "lg";
  light?: boolean;
}

const Logo = ({ size = "md", light = false }: LogoProps) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-3xl",
  };
  const subtitleSize = {
    sm: "text-[8px]",
    md: "text-[10px]",
    lg: "text-xs",
  };

  return (
    <div className="flex flex-col items-center select-none">
      <span
        className={`font-bold tracking-widest ${sizeClasses[size]} ${light ? "text-primary-foreground" : "text-primary"}`}
      >
        WCE WELCOME
      </span>
      <span
        className={`tracking-[0.2em] uppercase ${subtitleSize[size]} ${light ? "text-primary-foreground/70" : "text-muted-foreground"}`}
      >
        Immigration &amp; Foreign Affairs
      </span>
    </div>
  );
};

export default Logo;
