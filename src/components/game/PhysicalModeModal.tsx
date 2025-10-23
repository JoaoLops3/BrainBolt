import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Gamepad2,
  Wifi,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Cpu,
  Usb,
  Play,
  Settings,
  Lightbulb,
  BookOpen,
  Download,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PhysicalModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartPhysicalMode: () => void;
}

export const PhysicalModeModal = ({
  open,
  onOpenChange,
  onStartPhysicalMode,
}: PhysicalModeModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "O que é o Modo Físico?",
      icon: <Gamepad2 className="h-8 w-8 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Controle o Brain Bolt usando botões físicos conectados ao Arduino!
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">4</div>
              <div className="text-sm text-blue-800">Botões de Resposta</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">1</div>
              <div className="text-sm text-green-800">Botão Rápido</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-purple-800">LEDs de Feedback</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">1</div>
              <div className="text-sm text-orange-800">Buzzer Sonoro</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "O que você precisa?",
      icon: <Settings className="h-8 w-8 text-green-500" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Cpu className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-semibold text-blue-900">Arduino Uno</div>
                <div className="text-sm text-blue-700">Placa principal (~R$ 40-70)</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <Gamepad2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-semibold text-green-900">5 Botões</div>
                <div className="text-sm text-green-700">Push buttons ou arcade buttons</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <div className="font-semibold text-purple-900">5 LEDs + Buzzer</div>
                <div className="text-sm text-purple-700">Feedback visual e sonoro</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <Usb className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <div className="font-semibold text-orange-900">Cabo USB</div>
                <div className="text-sm text-orange-700">Para conectar ao computador</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Como configurar?",
      icon: <BookOpen className="h-8 w-8 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <div className="font-semibold">Execute o setup automático</div>
                <div className="text-sm text-gray-600">Rode: <code className="bg-gray-100 px-1 rounded">./setup-hardware.sh</code></div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <div className="font-semibold">Programe o Arduino</div>
                <div className="text-sm text-gray-600">Carregue o código em <code className="bg-gray-100 px-1 rounded">arduino/brainbolt_controller.ino</code></div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <div className="font-semibold">Inicie o sistema</div>
                <div className="text-sm text-gray-600">Execute: <code className="bg-gray-100 px-1 rounded">./start-hardware.sh</code></div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <div className="font-semibold">Conecte no app</div>
                <div className="text-sm text-gray-600">Acesse o Modo Físico e conecte o hardware</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Como funciona?",
      icon: <Play className="h-8 w-8 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-semibold text-green-900">Pergunta aparece na tela</div>
                <div className="text-sm text-green-700">LEDs do Arduino acendem indicando que pode responder</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Gamepad2 className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900">Pressione o botão correspondente</div>
                <div className="text-sm text-blue-700">A, B, C, D para as opções ou botão rápido para ser o primeiro</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-semibold text-purple-900">Feedback instantâneo</div>
                <div className="text-sm text-purple-700">LEDs piscam e buzzer toca confirmando sua resposta</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <Trophy className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-semibold text-orange-900">Pontuação em tempo real</div>
                <div className="text-sm text-orange-700">Veja seus pontos atualizados instantaneamente</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startPhysicalMode = () => {
    onOpenChange(false);
    onStartPhysicalMode();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            <div className="flex items-center justify-center gap-3 mb-2">
              {steps[currentStep].icon}
              {steps[currentStep].title}
            </div>
          </DialogTitle>
          <DialogDescription className="text-center">
            {currentStep === 0 && "Descubra como usar botões físicos no Brain Bolt"}
            {currentStep === 1 && "Lista completa de materiais necessários"}
            {currentStep === 2 && "Passo a passo para configurar"}
            {currentStep === 3 && "Veja como funciona na prática"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {steps[currentStep].content}
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center space-x-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentStep ? "bg-blue-500" : "bg-gray-300"
              )}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={startPhysicalMode}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6"
              >
                <Gamepad2 className="h-4 w-4 mr-2" />
                Começar Modo Físico
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Quick tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-semibold text-blue-900">Dica Rápida</div>
              <div className="text-sm text-blue-700">
                {currentStep === 0 && "O Modo Físico é perfeito para salas de aula e eventos!"}
                {currentStep === 1 && "Você pode encontrar todos os materiais em lojas de eletrônicos ou online."}
                {currentStep === 2 && "O setup automático faz toda a configuração para você!"}
                {currentStep === 3 && "É muito mais divertido responder com botões físicos!"}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
