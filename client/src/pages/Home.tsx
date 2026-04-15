import { useSistemaAuth } from "@/contexts/SistemaAuthContext";
import Login from "./Login";
import Dashboard from "./Dashboard";

export default function Home() {
  const { isAuthenticated, loading } = useSistemaAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1B3E]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-200 text-sm">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <Dashboard />;
}
