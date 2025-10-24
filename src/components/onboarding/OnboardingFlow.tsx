import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bell,
  Heart,
  Trophy,
  Users,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Play,
} from "lucide-react";
import { useNativeNotifications } from "@/hooks/useNativeNotifications";
import { useToast } from "@/hooks/use-toast";
import { InteractiveTutorial } from "@/components/tutorial/InteractiveTutorial";

interface OnboardingFlowProps {
  onComplete: () => void;
}

type OnboardingStep = "welcome" | "permissions" | "features" | "ready";

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const { requestPermission, permission } = useNativeNotifications();
  const { toast } = useToast();
  const isNative = Capacitor.isNativePlatform();

  // Verificar se já passou pelo onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(
      "brainbolt-onboarding-completed"
    );
    if (hasCompletedOnboarding) {
      onComplete();
    }
  }, [onComplete]);

  const handlePermissionsNext = async () => {
    setIsLoading(true);

    if (isNative) {
      // No iOS, sempre tentar solicitar (dialog nativo)
      const granted = await requestPermission();
      setNotificationsEnabled(granted);

      toast({
        title: granted ? "✅ Configurado!" : "ℹ️ Configuração",
        description: granted
          ? "Notificações ativadas com sucesso!"
          : "Você pode ativar depois nas configurações.",
      });
    } else {
      // Na web, solicitar apenas se usuário marcou
      if (notificationsEnabled && permission !== "granted") {
        await requestPermission();
      }
    }

    setIsLoading(false);
    setCurrentStep("features");
  };

  const handleComplete = () => {
    // Salvar que completou onboarding
    localStorage.setItem("brainbolt-onboarding-completed", "true");
    localStorage.setItem("brainbolt-first-time", "false");

    // Salvar preferências
    const preferences = {
      notificationsEnabled,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem("brainbolt-preferences", JSON.stringify(preferences));

    // Mostrar tutorial interativo
    setShowTutorial(true);
  };

  const handleTutorialComplete = () => {
    localStorage.setItem("brainbolt-tutorial-completed", "true");
    setShowTutorial(false);
    onComplete();
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    onComplete();
  };

  const renderWelcomeStep = () => (
    <Card className="w-full max-w-md mx-auto backdrop-blur-lg bg-white/95 border-white/30 shadow-2xl">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Bem-vindo ao Brain Bolt!
        </CardTitle>
        <p className="text-gray-600 mt-2">
          O quiz mais divertido e desafiador para exercitar sua mente!
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium">Desafios</p>
            <p className="text-xs text-gray-500">Milhares de perguntas</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium">Multiplayer</p>
            <p className="text-xs text-gray-500">Jogue com amigos</p>
          </div>
        </div>
        <Button
          onClick={() => setCurrentStep("permissions")}
          className="w-full"
          size="lg"
        >
          Começar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderPermissionsStep = () => (
    <Card className="w-full max-w-md mx-auto backdrop-blur-lg bg-white/95 border-white/30 shadow-2xl">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Bell className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-xl font-bold">
          {isNative ? "Notificações" : "Permissões"}
        </CardTitle>
        <p className="text-gray-600 text-sm">
          {isNative
            ? "Quer receber lembretes e conquistas?"
            : "Configure suas preferências para a melhor experiência"}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {isNative ? (
          // Versão iOS - Simples
          <>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ativar Notificações?</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Receba lembretes diários, conquistas e desafios especiais para
                  manter o hábito de exercitar sua mente!
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">
                    Será mostrado o dialog nativo do iOS
                  </span>
                </p>
              </div>
            </div>
          </>
        ) : (
          // Versão Web - Completa
          <>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Notificações Push</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Receba lembretes diários, conquistas e desafios especiais
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="notifications"
                        checked={notificationsEnabled}
                        onCheckedChange={(checked) =>
                          setNotificationsEnabled(checked as boolean)
                        }
                      />
                      <label htmlFor="notifications" className="text-sm">
                        Ativar notificações
                      </label>
                      <Badge variant="secondary" className="text-xs">
                        Recomendado
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-amber-600" />
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Dica:</span> Notificações
                  ajudam você a manter o hábito de exercitar sua mente
                  diariamente!
                </p>
              </div>
            </div>
          </>
        )}

        <Button
          onClick={handlePermissionsNext}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading
            ? "Configurando..."
            : isNative
            ? "Ativar Notificações"
            : "Continuar"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderFeaturesStep = () => (
    <Card className="w-full max-w-md mx-auto backdrop-blur-lg bg-white/95 border-white/30 shadow-2xl">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-xl font-bold">Recursos Incríveis</CardTitle>
        <p className="text-gray-600 text-sm">
          Descubra tudo que você pode fazer no Brain Bolt
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-semibold text-sm">6 Categorias</p>
              <p className="text-xs text-gray-600">
                Esportes, História, Ciências e mais!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-semibold text-sm">Modo Multiplayer</p>
              <p className="text-xs text-gray-600">
                Desafie amigos em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold text-sm">Conquistas</p>
              <p className="text-xs text-gray-600">
                Desbloqueie troféus e personagens
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100">
            <CheckCircle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-semibold text-sm">Estatísticas</p>
              <p className="text-xs text-gray-600">
                Acompanhe seu progresso e evolução
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setCurrentStep("ready")}
          className="w-full"
          size="lg"
        >
          Entendi!
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderReadyStep = () => (
    <Card className="w-full max-w-md mx-auto backdrop-blur-lg bg-white/95 border-white/30 shadow-2xl">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center animate-pulse">
          <Play className="h-10 w-10 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Tudo Pronto!
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Você está preparado para começar sua jornada no Brain Bolt!
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-xs font-medium">Termos</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-xs font-medium">Notificações</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-xs font-medium">Recursos</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg p-4 text-center">
          <p className="text-sm font-semibold text-gray-800">
            🎉 Tudo pronto para começar!
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Comece agora e divirta-se aprendendo
          </p>
        </div>

        <Button onClick={handleComplete} className="w-full" size="lg">
          Começar a Jogar!
          <Play className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  const stepContent = {
    welcome: renderWelcomeStep,
    permissions: renderPermissionsStep,
    features: renderFeaturesStep,
    ready: renderReadyStep,
  };

  return (
    <>
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg border-0 bg-transparent shadow-none p-4 sm:p-6">
          <div className="min-h-[600px] flex items-center justify-center">
            {stepContent[currentStep]()}
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {["welcome", "permissions", "features", "ready"].map(
                (step, index) => {
                  const allSteps = [
                    "welcome",
                    "permissions",
                    "features",
                    "ready",
                  ];
                  const currentIndex = allSteps.indexOf(currentStep);

                  return (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        currentIndex >= index ? "bg-primary" : "bg-gray-300"
                      }`}
                    />
                  );
                }
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tutorial Interativo */}
      {showTutorial && (
        <InteractiveTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}
    </>
  );
};
