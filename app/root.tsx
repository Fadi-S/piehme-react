import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLocation,
} from "react-router";
import {store} from "~/base/store";

import type { Route } from "./+types/root";
import "./app.css";
import {Provider} from "react-redux";
import { useEffect } from "react";
import { isSuspiciousPath, getSecurityAlertPayload, sendSecurityEmail } from "~/base/security";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
      <html className="h-full bg-gray-100 overflow-x-hidden">
      <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
        <Meta/>
        <Links/>
      </head>
      <body className="h-full overflow-x-hidden">
      {children}
      <ScrollRestoration/>
      <Scripts/>
      </body>
      </html>
  );
}


export default function App() {
  return (
      <Provider store={store}>
              <div className="w-full overflow-x-hidden">
                  <Outlet/>
              </div>
      </Provider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;
  const location = useLocation();

  useEffect(() => {
    const sendAlert = async () => {
      if (isRouteErrorResponse(error) && error.status === 404) {
        const currentPath = location.pathname;
        
        if (isSuspiciousPath(currentPath)) {
          try {
            const alertPayload = await getSecurityAlertPayload(currentPath);
            
            // Send email directly from frontend
            const emailSent = await sendSecurityEmail(alertPayload);
            
            if (emailSent) {
              console.warn('🚨 Security alert email sent for 404 on suspicious path:', currentPath);
            }
          } catch (err) {
            console.error('Failed to send security alert:', err);
          }
        }
      }
    };
    
    sendAlert();
  }, [error, location.pathname]);

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
