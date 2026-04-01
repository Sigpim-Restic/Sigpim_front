import { Navigate } from "react-router";

export function RedirectToStep1() {
  return <Navigate to="/imoveis/novo/etapa-1" replace />;
}
