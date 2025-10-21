import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skull, Trophy, Flame, Target, ArrowLeft } from "lucide-react";

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-lg bg-gradient-to-br from-purple-500/95 via-pink-500/95 to-purple-600/95 border-white/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Flame className="h-6 w-6 text-white" />
            Outros Modos
          </DialogTitle>
          <DialogDescription className="text-white/90">
            Escolha um modo de jogo especial para desafiar suas habilidades!
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 mt-4">
          {/* Modo Sobrevivência */}
          <Card
            className="backdrop-blur-lg bg-white/20 border-white/30 hover:bg-white/30 shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
            onClick={onSelectSurvival}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-white/20 group-hover:bg-white/30 group-hover:scale-110 transition-all">
                  <Skull className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
                    🔥 Modo Sobrevivência
                    <span className="text-xs bg-white/30 text-white px-2 py-1 rounded-full">
                      NOVO!
                    </span>
                  </h3>
                  <p className="text-sm text-white/80 mb-3">
                    Responda até errar! Cada acerto aumenta a dificuldade.
                    Quanto tempo você aguenta?
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-white">
                      <Target className="h-3 w-3" />
                      <span>Dificuldade progressiva</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-white">
                      <Trophy className="h-3 w-3" />
                      <span>Ranking global</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-white">
                      <Flame className="h-3 w-3" />
                      <span>Recompensas diárias</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modos futuros (desabilitados) */}
          <Card className="backdrop-blur-lg bg-white/10 border-white/20 opacity-60 cursor-not-allowed">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-white/10">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
                    🏆 Modo Torneio
                    <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                      EM BREVE
                    </span>
                  </h3>
                  <p className="text-sm text-white/70">
                    Participe de torneios semanais e compita com jogadores do
                    mundo todo!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/10 border-white/20 opacity-60 cursor-not-allowed">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-white/10">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
                    🎯 Modo Desafio Diário
                    <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                      EM BREVE
                    </span>
                  </h3>
                  <p className="text-sm text-white/70">
                    Um novo desafio todos os dias com recompensas exclusivas!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-start mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
