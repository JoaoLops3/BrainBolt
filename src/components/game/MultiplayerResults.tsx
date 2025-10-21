import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Users, ArrowLeft } from "lucide-react";
import { MultiplayerRoom } from "@/types/game";
import { useAuth } from "@/contexts/AuthContext";

interface MultiplayerResultsProps {
  room: MultiplayerRoom;
  onBackToMenu: () => void;
  isHost: boolean;
}

export const MultiplayerResults = ({
  room,
  onBackToMenu,
  isHost,
}: MultiplayerResultsProps) => {
  const { user } = useAuth();

  const userScore =
    user?.id === room.host_id ? room.host_score : room.guest_score;
  const opponentScore =
    user?.id === room.host_id ? room.guest_score : room.host_score;

  const isWinner = room.winner_id === user?.id;
  const isDraw = room.winner_id === null;

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4 sm:p-6 no-scroll safe-top safe-bottom">
      <Card className="w-full max-w-md backdrop-blur-lg bg-white/95 border-white/30">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isWinner ? (
              <Trophy className="h-16 w-16 text-yellow-500" />
            ) : isDraw ? (
              <Medal className="h-16 w-16 text-gray-500" />
            ) : (
              <Users className="h-16 w-16 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isWinner
              ? "🎉 Você Venceu!"
              : isDraw
              ? "🤝 Empate!"
              : "😔 Você Perdeu"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score comparison */}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {userScore}
                </div>
                <div className="text-sm text-muted-foreground">
                  Sua pontuação
                </div>
              </div>
              <div className="text-4xl font-bold text-muted-foreground">VS</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  {opponentScore}
                </div>
                <div className="text-sm text-muted-foreground">Oponente</div>
              </div>
            </div>
          </div>

          {/* Game stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">10</div>
              <div className="text-sm text-muted-foreground">Perguntas</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">
                {Math.round((userScore + opponentScore) / 20)}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa total</div>
            </div>
          </div>

          {/* Performance stats */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">
              Estatísticas da Partida
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Acertos:</span>
                <div className="font-bold">
                  {Math.floor(userScore / 100)}/10 vs{" "}
                  {Math.floor(opponentScore / 100)}/10
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Precisão:</span>
                <div className="font-bold">
                  {Math.round((userScore / 1000) * 100)}% vs{" "}
                  {Math.round((opponentScore / 1000) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <Button onClick={onBackToMenu} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
