import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BrainBoltGame } from "@/components/game/BrainBoltGame";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    // Timeout de segurança para verificação do onboarding
    const onboardingTimeout = setTimeout(() => {
      console.warn("Onboarding check timeout");
      setCheckingOnboarding(false);
    }, 3000); // 3 segundos

    if (user) {
      // Verificar se é primeira vez do usuário
      try {
        const hasCompletedOnboarding = localStorage.getItem(
          "brainbolt-onboarding-completed"
        );
        const isFirstTime =
          localStorage.getItem("brainbolt-first-time") !== "false";

        if (!hasCompletedOnboarding || isFirstTime) {
          setShowOnboarding(true);
        }
        setCheckingOnboarding(false);
        clearTimeout(onboardingTimeout);
      } catch (error) {
        console.error("Error checking onboarding:", error);
        setCheckingOnboarding(false);
        clearTimeout(onboardingTimeout);
      }
    } else if (!loading) {
      // Se não há usuário e não está loading, parar de verificar onboarding
      setCheckingOnboarding(false);
      clearTimeout(onboardingTimeout);
    }

    return () => clearTimeout(onboardingTimeout);
  }, [user, loading]);

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-primary overflow-y-auto safe-top safe-bottom">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (showOnboarding) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-primary overflow-y-auto safe-top safe-bottom">
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      </div>
    );
  }

  return <BrainBoltGame />;
};

export default Index;
