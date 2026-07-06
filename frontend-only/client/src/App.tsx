import { useEffect } from "react";import { Route, Switch, useLocation } from "wouter";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthLoading from "./components/AuthLoading";

import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Result from "./pages/Result";
import About from "./pages/About";
import News from "./pages/News";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Chatbot from "./components/Chatbot";

function Router() {
  const [, setLocation] = useLocation();

  const { user, initialized } = useAuth();

  useEffect(() => {
    if (!initialized) return;

    const path = window.location.pathname;

    if (user) {
      if (
        path === "/" ||
        path === "/login" ||
        path === "/register"
      ) {
        setLocation("/dashboard", {
          replace: true,
        });
      }
    } else {
      if (
        path !== "/login" &&
        path !== "/register"
      ) {
        setLocation("/login", {
          replace: true,
        });
      }
    }
  }, [initialized, user, setLocation]);

  if (!initialized) {
    return <AuthLoading />;
  }

  return (
    <Switch>

      {/* Public Pages */}

      <Route path="/login" component={Login} />

      <Route path="/register" component={Register} />

      <Route path="/about" component={About} />

      {/* Protected Pages */}

      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/history">
        <ProtectedRoute>
          <History />
        </ProtectedRoute>
      </Route>

      <Route path="/news">
        <ProtectedRoute>
          <News />
        </ProtectedRoute>
      </Route>

      <Route path="/chat">
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>

      <Route path="/result">
        <ProtectedRoute>
          <Result />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function ChatbotWrapper() {
  const [location] = useLocation();
  if (location === "/chat") return null;
  return <Chatbot />;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster richColors position="top-right" />
            <Router />
            <ChatbotWrapper />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;