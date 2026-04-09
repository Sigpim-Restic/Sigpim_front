import { Navigate } from "react-router";
import { useAuth } from "./AuthContext";

/** Redireciona para /login se o usuário não estiver autenticado. */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { autenticado } = useAuth();
  if (!autenticado) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
