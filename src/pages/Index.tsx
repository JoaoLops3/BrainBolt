import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BrainBoltGame } from "@/components/game/BrainBoltGame";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-primary overflow-y-auto safe-top safe-bottom">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <BrainBoltGame />;
};

export default Index;
