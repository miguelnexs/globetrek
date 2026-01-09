import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: "default" | "featured" | "accent";
}

const DashboardCard = ({
  title,
  subtitle,
  icon,
  children,
  className,
  variant = "default",
}: DashboardCardProps) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-travel transition-all duration-300 hover:shadow-travel-lg",
        variant === "featured" && "border-gold/30 bg-gradient-to-br from-card to-sand/30",
        variant === "accent" && "border-turquoise/30 bg-gradient-to-br from-card to-turquoise/5",
        className
      )}
    >
      {/* Decorative corner */}
      <div
        className={cn(
          "absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150",
          variant === "default" && "bg-primary",
          variant === "featured" && "bg-gold",
          variant === "accent" && "bg-turquoise"
        )}
      />

      {/* Header */}
      <div className="relative mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-card-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
            variant === "default" && "bg-primary/10 text-primary",
            variant === "featured" && "bg-gold/20 text-gold",
            variant === "accent" && "bg-turquoise/20 text-turquoise"
          )}
        >
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
};

export default DashboardCard;
