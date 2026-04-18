import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { AuthProvider } from "./auth/AuthContext";
import { router } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  );
}
