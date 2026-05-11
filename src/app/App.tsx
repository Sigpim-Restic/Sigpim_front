import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { SessionExpiredModal } from "./SessionExpiredModal";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={3500}
      />
      <SessionExpiredModal />
    </>
  );
}