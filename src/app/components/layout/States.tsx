import React from "react";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { cn } from "../ui/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-gray-600">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function ErrorState({
  title = "Erro ao carregar dados",
  description = "Ocorreu um erro ao tentar carregar as informações. Por favor, tente novamente.",
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <XCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-gray-600">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

interface SuccessStateProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export function SuccessState({
  title,
  description,
  actions,
}: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h3 className="mb-3 text-2xl font-semibold text-gray-900">{title}</h3>
      <p className="mb-8 max-w-md text-sm text-gray-600">{description}</p>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}

interface AlertBoxProps {
  variant?: "info" | "warning" | "error" | "success";
  title?: string;
  children: React.ReactNode;
}

export function AlertBox({
  variant = "info",
  title,
  children,
}: AlertBoxProps) {
  const variants = {
    info: {
      bg: "bg-blue-50 border-blue-200",
      icon: <Info className="h-5 w-5 text-blue-600" />,
      title: "text-blue-900",
      text: "text-blue-800",
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-200",
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      title: "text-yellow-900",
      text: "text-yellow-800",
    },
    error: {
      bg: "bg-red-50 border-red-200",
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      title: "text-red-900",
      text: "text-red-800",
    },
    success: {
      bg: "bg-green-50 border-green-200",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      title: "text-green-900",
      text: "text-green-800",
    },
  };

  const style = variants[variant];

  return (
    <div className={cn("rounded-lg border p-4", style.bg)}>
      <div className="flex gap-3">
        <div className="shrink-0">{style.icon}</div>
        <div className="flex-1">
          {title && (
            <h4 className={cn("mb-1 font-semibold text-sm", style.title)}>
              {title}
            </h4>
          )}
          <div className={cn("text-sm", style.text)}>{children}</div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  variant = "default",
}: StatCardProps) {
  const variants = {
    default: "bg-white border-gray-200",
    primary: "bg-blue-50 border-blue-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    danger: "bg-red-50 border-red-200",
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md",
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-2 text-sm font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/50">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
