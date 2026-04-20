import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { SettingsProvider } from "@/hooks/useSettings";
import "./styles.css";

const router = createRouter({ routeTree });

// Inject Convex URL from env
const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://sleek-cardinal-373.eu-west-1.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    </ConvexProvider>
  </React.StrictMode>
);
