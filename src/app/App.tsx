import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={6000}
        toastOptions={{
          classNames: {
            error: "duration-[8000ms]",
          },
        }}
      />
    </>
  );
}