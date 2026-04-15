import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import PortalPage from "@/pages/Portal";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SistemaAuthProvider } from "./contexts/SistemaAuthContext";
import { PortalAuthProvider } from "./contexts/PortalAuthContext";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/portal"} component={PortalPage} />
      <Route path={"/portal/*"} component={PortalPage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <SistemaAuthProvider>
          <PortalAuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </PortalAuthProvider>
        </SistemaAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
