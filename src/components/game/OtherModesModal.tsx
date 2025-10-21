import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skull, Trophy, Flame, Target, X } from "lucide-react";

interface OtherModesModalProps {
  open: boolean;
  onClose: () => void;
  onSelectSurvival: () => void;
}

export const OtherModesModal = ({
  open,
  onClose,
  onSelectSurvival,
}: OtherModesModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[90vw] sm:max-w-lg max-h-[85vh] backdrop-blur-lg bg-gradient-to-br from-[hsl(262,83%,58%)]/95 via-[hsl(330,81%,60%)]/95 to-[hsl(45,93%,58%)]/95 border-white/30 modal-responsive safe-top safe-bottom rounded-2xl sm:rounded-3xl p-0 gap-0 overflow-hidden [&>.absolute.right-4.top-4]:!hidden">
        {/* Botão X customizado na esquerda */}
        <DialogClose asChild>
          <button className="absolute top-4 left-4 z-50 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/30 shadow-lg flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </DialogClose>

        <div className="overflow-y-auto max-h-[85vh] p-6 pt-12">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              Outros Modos
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-white/90 text-center">
              Escolha um modo de jogo especial para desafiar suas habilidades!
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-2 sm:mt-4">
            {/* Modo Sobrevivência */}
            <Card
              className="backdrop-blur-lg bg-white/20 border-0 hover:bg-white/30 shadow-xl hover:shadow-2xl transition-all cursor-pointer group rounded-2xl"
              onClick={onSelectSurvival}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-white/20 group-hover:bg-white/30 group-hover:scale-110 transition-all">
                    <Skull className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-lg sm:text-xl font-bold mb-2 flex flex-wrap items-center gap-2 text-white">
                      <span>🔥 Modo Sobrevivência</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-white/80 mb-3">
                      Responda até errar! Cada acerto aumenta a dificuldade.
                      Quanto tempo você aguenta?
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-white">
                        <Target className="h-3 w-3" />
                        <span className="hidden xs:inline sm:inline">
                          Dificuldade progressiva
                        </span>
                        <span className="xs:hidden sm:hidden">Progressivo</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-white">
                        <Trophy className="h-3 w-3" />
                        <span>Ranking global</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-white">
                        <Flame className="h-3 w-3" />
                        <span className="hidden xs:inline sm:inline">
                          Recompensas diárias
                        </span>
                        <span className="xs:hidden sm:hidden">Recompensas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modos futuros (desabilitados) */}
            <Card className="backdrop-blur-lg bg-white/10 border-0 opacity-60 cursor-not-allowed rounded-2xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-white/10">
                    <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-lg sm:text-xl font-bold mb-2 flex flex-wrap items-center gap-2 text-white">
                      <span>🏆 Modo Torneio</span>
                      <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                        EM BREVE
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70">
                      Participe de torneios semanais e compita com jogadores do
                      mundo todo!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-lg bg-white/10 border-0 opacity-60 cursor-not-allowed rounded-2xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-white/10">
                    <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-lg sm:text-xl font-bold mb-2 flex flex-wrap items-center gap-2 text-white">
                      <span>🎯 Modo Desafio Diário</span>
                      <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                        EM BREVE
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70">
                      Um novo desafio todos os dias com recompensas exclusivas!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
