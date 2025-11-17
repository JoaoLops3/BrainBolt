import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy } from "lucide-react";
import { useArduinoSerial } from "@/hooks/useArduinoSerial";
import { useToast } from "@/hooks/use-toast";
import { CompetitionModal } from "./CompetitionModal";
import { GameResultModal } from "./GameResultModal";
import { useGameQuestions } from "@/hooks/useGameQuestions";
import { Question } from "@/types/game";
import { cn } from "@/lib/utils";

interface PhysicalModeGameProps {
  onBackToMenu: () => void;
}

export const PhysicalModeGame = ({ onBackToMenu }: PhysicalModeGameProps) => {
  const { sendCommand, onMessage } = useArduinoSerial();
  const { toast } = useToast();
  const { selectQuestions } = useGameQuestions();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);

  const [showCompetitionModal, setShowCompetitionModal] = useState(false);
  const [competitionMode, setCompetitionMode] = useState<"waiting" | "winner">(
    "waiting"
  );
  const [competitionWinner, setCompetitionWinner] = useState<
    "FAST1" | "FAST2" | null
  >(null);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2 | null>(null);
  const [reactionTime, setReactionTime] = useState<number | undefined>(
    undefined
  );

  const [canAnswer, setCanAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [showResultModal, setShowResultModal] = useState(false);

  // Refs para capturar valores atuais sem causar re-execuções do useEffect
  const canAnswerRef = useRef(canAnswer);
  const competitionModeRef = useRef(competitionMode);
  const selectedAnswerRef = useRef(selectedAnswer);
  const currentQuestionRef = useRef(currentQuestion);
  const currentPlayerRef = useRef(currentPlayer);
  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  const gameQuestionsRef = useRef(gameQuestions);
  const scoresRef = useRef(scores);
  const handleCompetitionWinnerRef = useRef<
    (winner: "FAST1" | "FAST2", time: number) => void
  >(() => {});
  const handleAnswerPressRef = useRef<(button: string) => void>(() => {});
  const startNewQuestionRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const endGameRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const initializedRef = useRef(false);
  const firstQuestionStartedRef = useRef(false);

  // Atualizar refs quando os valores mudarem
  useEffect(() => {
    canAnswerRef.current = canAnswer;
  }, [canAnswer]);

  useEffect(() => {
    competitionModeRef.current = competitionMode;
  }, [competitionMode]);

  useEffect(() => {
    selectedAnswerRef.current = selectedAnswer;
  }, [selectedAnswer]);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    currentPlayerRef.current = currentPlayer;
  }, [currentPlayer]);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    gameQuestionsRef.current = gameQuestions;
  }, [gameQuestions]);

  useEffect(() => {
    scoresRef.current = scores;
  }, [scores]);

  // Inicializar perguntas (apenas uma vez na montagem)
  useEffect(() => {
    if (initializedRef.current) return;
    
    console.log("🎮 PhysicalModeGame montado");
    initializedRef.current = true;

    // Usar sistema de seleção com controle de repetições
    const allSelected = selectQuestions(2); // 2 por categoria = 16 questões
    const selected = allSelected.slice(0, 10); // Limitar a 10
    
    if (selected.length === 0) {
      console.error("❌ Nenhuma pergunta selecionada!");
      toast({
        title: "Erro",
        description: "Não foi possível carregar as perguntas. Tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    console.log(`📚 ${selected.length} perguntas carregadas`);
    setGameQuestions(selected);
    setCurrentQuestion(selected[0]);

    return () => {
      console.log("🔴 PhysicalModeGame desmontado");
      initializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas uma vez na montagem - selectQuestions é estável

  // Iniciar primeira pergunta após as perguntas serem carregadas e as funções estarem prontas
  useEffect(() => {
    console.log("🔍 Verificando condições para iniciar primeira pergunta:", {
      gameQuestionsLength: gameQuestions.length,
      hasCurrentQuestion: !!currentQuestion,
      hasStartNewQuestionRef: !!startNewQuestionRef.current,
      firstQuestionStarted: firstQuestionStartedRef.current
    });
    
    // Só executar uma vez se temos perguntas e a função startNewQuestion está disponível
    if (
      gameQuestions.length > 0 && 
      currentQuestion && 
      startNewQuestionRef.current && 
      !firstQuestionStartedRef.current
    ) {
      console.log("🚀 Todas as condições atendidas! Iniciando primeira pergunta...");
      firstQuestionStartedRef.current = true;
      const timer = setTimeout(() => {
        console.log("⏰ Timer executado, chamando startNewQuestion...");
        if (startNewQuestionRef.current) {
          startNewQuestionRef.current();
        } else {
          console.error("❌ startNewQuestionRef não disponível no momento da execução!");
        }
      }, 500);
      return () => {
        clearTimeout(timer);
        // Resetar flag se o componente desmontar antes de iniciar
        if (!initializedRef.current) {
          console.log("🔄 Resetando flag firstQuestionStarted");
          firstQuestionStartedRef.current = false;
        }
      };
    } else if (gameQuestions.length === 0 && initializedRef.current) {
      console.warn("⚠️ gameQuestions está vazio, mas componente foi inicializado!");
    }
  }, [gameQuestions.length, currentQuestion]); // Executar quando as perguntas estiverem carregadas

  // Registrar callback para receber mensagens do Arduino (apenas uma vez)
  useEffect(() => {
    console.log("🔌 Registrando handler de mensagens do Arduino");

    const handler = (data: string) => {
      try {
        const message = JSON.parse(data);

        console.log("🎮 PhysicalModeGame recebeu:", message);

        // Usar refs para obter valores atuais sem re-executar o useEffect
        const currentCompetitionMode = competitionModeRef.current;
        const currentCanAnswer = canAnswerRef.current;

        // Apenas processar competition_winner se estivermos aguardando
        if (
          message.type === "competition_winner" &&
          currentCompetitionMode === "waiting"
        ) {
          console.log(
            "🏆 Processando vencedor:",
            message.winner,
            message.reaction_time
          );
          handleCompetitionWinnerRef.current(
            message.winner,
            message.reaction_time
          );
        }
        // Apenas processar button_press de respostas (A, B, C, D) se pode responder
        else if (message.type === "button_press" && currentCanAnswer) {
          const button = message.button;
          // Ignorar botões FAST durante respostas
          if (button !== "FAST1" && button !== "FAST2") {
            console.log("🎯 Processando resposta:", button);
            handleAnswerPressRef.current(button);
          } else {
            console.log(
              "⚠️ Botão FAST ignorado - não está em modo de competição"
            );
          }
        }
      } catch (error) {
        // Mensagem não é JSON - apenas ignorar silenciosamente
      }
    };

    // onMessage agora retorna uma função de cleanup
    const cleanup = onMessage(handler);

    // Retornar a função de cleanup para remover o handler quando o componente desmontar
    return () => {
      console.log("🔌 Removendo handler de mensagens do Arduino");
      cleanup();
    };
  }, [onMessage]); // Agora só depende de onMessage, que é estável

  // Iniciar nova pergunta
  const startNewQuestion = useCallback(async () => {
    try {
      console.log("🆕 Iniciando nova pergunta...");

      setSelectedAnswer(null);
      setShowAnswer(false);
      setCanAnswer(false);
      setCompetitionWinner(null);
      setCurrentPlayer(null);

      // Mostrar modal de competição
      setCompetitionMode("waiting");
      setShowCompetitionModal(true);

      console.log("📱 Estados resetados - Modal aberto em modo waiting");

      // Enviar comando para Arduino iniciar competição
      await sendCommand({
        type: "question_start",
      });

      toast({
        title: "Nova Pergunta!",
        description: "Aperte FAST1 ou FAST2 para responder!",
      });

      console.log("✅ startNewQuestion completo");
    } catch (error) {
      console.error("❌ Erro em startNewQuestion:", error);
    }
  }, [sendCommand, toast]);

  const handleCompetitionWinner = useCallback((winner: "FAST1" | "FAST2", time: number) => {
    try {
      console.log("🏆 handleCompetitionWinner chamado:", winner, time);

      setCompetitionWinner(winner);
      setReactionTime(time);
      setCompetitionMode("winner");
      setCurrentPlayer(winner === "FAST1" ? 1 : 2);

      console.log("🎮 Estados atualizados - winner:", winner, "mode: winner");

      const playerName = winner === "FAST1" ? "Jogador 1" : "Jogador 2";

      toast({
        title: "🏆 Vencedor da Competição!",
        description: `${playerName} apertou primeiro (${time}ms)`,
      });

      // Fechar modal após 3 segundos e liberar respostas
      setTimeout(() => {
        console.log("⏱️ 3.5 segundos passaram, liberando respostas");
        setShowCompetitionModal(false);
        setCanAnswer(true);

        toast({
          title: `🎯 ${playerName}`,
          description: "Agora você pode responder usando A, B, C ou D!",
        });
      }, 3500);
    } catch (error) {
      console.error("❌ Erro em handleCompetitionWinner:", error);
    }
  }, [toast]);

  // Atualizar refs sempre que as funções mudarem
  useEffect(() => {
    handleCompetitionWinnerRef.current = handleCompetitionWinner;
  }, [handleCompetitionWinner]);

  useEffect(() => {
    startNewQuestionRef.current = startNewQuestion;
  }, [startNewQuestion]);

  const handleAnswerPress = useCallback(async (button: string) => {
    try {
      // Usar refs para obter valores atuais
      const currentCanAnswer = canAnswerRef.current;
      const currentSelectedAnswer = selectedAnswerRef.current;
      
      if (!currentCanAnswer || currentSelectedAnswer !== null) {
        console.log(
          "⚠️ handleAnswerPress ignorado - canAnswer:",
          currentCanAnswer,
          "selectedAnswer:",
          currentSelectedAnswer
        );
        return;
      }

      const answerIndex = ["A", "B", "C", "D"].indexOf(button);
      if (answerIndex === -1) {
        console.log("⚠️ Botão inválido:", button);
        return;
      }

      console.log("✅ Processando resposta:", button, "Index:", answerIndex);

      setSelectedAnswer(answerIndex);
      setShowAnswer(true);
      setCanAnswer(false);

      const currentQuestionValue = currentQuestionRef.current;
      const isCorrect = answerIndex === currentQuestionValue?.correctAnswer;

      if (isCorrect) {
        // Atualizar pontuação usando função de atualização funcional
        const currentPlayerValue = currentPlayerRef.current;
        if (currentPlayerValue === 1) {
          setScores((prev) => ({ ...prev, player1: prev.player1 + 10 }));
        } else if (currentPlayerValue === 2) {
          setScores((prev) => ({ ...prev, player2: prev.player2 + 10 }));
        }

        // Enviar feedback ao Arduino
        await sendCommand({
          type: "answer_correct",
        });

        toast({
          title: "✅ Resposta Correta!",
          description: `Jogador ${currentPlayerValue} ganhou 10 pontos!`,
        });
      } else {
        await sendCommand({
          type: "answer_wrong",
        });

        toast({
          title: "❌ Resposta Incorreta",
          description: "Tente novamente na próxima!",
          variant: "destructive",
        });
      }

      // Próxima pergunta após 3 segundos
      setTimeout(() => {
        const nextIndex = currentQuestionIndexRef.current + 1;
        const currentGameQuestions = gameQuestionsRef.current;
        
        console.log(
          "📊 Verificando próxima pergunta - Index atual:",
          currentQuestionIndexRef.current,
          "Próximo Index:",
          nextIndex,
          "Total de perguntas:",
          currentGameQuestions.length,
          "Array de perguntas:",
          currentGameQuestions
        );
        
        if (currentGameQuestions.length === 0) {
          console.error("❌ ERRO: Array de perguntas vazio!");
          return;
        }
        
        if (nextIndex < currentGameQuestions.length) {
          console.log("➡️ Avançando para próxima pergunta:", nextIndex);
          setCurrentQuestionIndex(nextIndex);
          setCurrentQuestion(currentGameQuestions[nextIndex]);
          // Pequeno delay antes de iniciar nova pergunta
          setTimeout(() => {
            startNewQuestionRef.current();
          }, 100);
        } else {
          console.log("🏁 Fim do jogo! Todas as perguntas foram respondidas.");
          endGameRef.current();
        }
      }, 3000);
    } catch (error) {
      console.error("❌ Erro em handleAnswerPress:", error);
      toast({
        title: "Erro",
        description:
          "Ocorreu um erro ao processar a resposta. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [sendCommand, toast]);

  // Atualizar ref sempre que a função mudar
  useEffect(() => {
    handleAnswerPressRef.current = handleAnswerPress;
  }, [handleAnswerPress]);

  const endGame = useCallback(async () => {
    const currentScores = scoresRef.current;
    const currentIndex = currentQuestionIndexRef.current;
    const totalQuestions = gameQuestionsRef.current.length;
    
    console.log("🎮 endGame chamado!");
    console.log("📊 Estado do jogo:", {
      indexAtual: currentIndex,
      totalPerguntas: totalQuestions,
      scores: currentScores
    });
    
    // Enviar comando de fim de jogo ao Arduino
    try {
      await sendCommand({
        type: "game_end",
      });
    } catch (error) {
      console.error("❌ Erro ao enviar comando de fim de jogo:", error);
    }

    // Mostrar modal de resultado
    setShowResultModal(true);
  }, [sendCommand]);

  // Atualizar ref sempre que a função mudar
  useEffect(() => {
    endGameRef.current = endGame;
  }, [endGame]);

  const getButtonStyle = (index: number) => {
    if (!showAnswer) {
      return selectedAnswer === index
        ? "bg-white/30 border-white/30 text-white active:bg-white/30"
        : "bg-white/5 border-white/20 hover:bg-white/20 text-white active:bg-white/30";
    }

    if (index === currentQuestion?.correctAnswer) {
      return "bg-green-500/90 backdrop-blur-lg text-white border-green-400 shadow-lg shadow-green-500/50";
    }

    if (selectedAnswer === index) {
      return "bg-red-500/90 backdrop-blur-lg text-white border-red-400 shadow-lg shadow-red-500/50";
    }

    return "bg-white/5 border-white/20 text-white opacity-60";
  };

  if (!currentQuestion) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <CompetitionModal
        winner={competitionWinner}
        reactionTime={reactionTime}
        isOpen={showCompetitionModal}
        onClose={() => {
          console.log("🔒 onClose chamado - mode:", competitionMode);
          // Não permitir fechar o modal durante modo "waiting"
          if (competitionMode === "winner") {
            console.log("✅ Fechando modal (modo winner)");
            setShowCompetitionModal(false);
          } else {
            console.log(
              "⚠️ Tentativa de fechar modal em modo waiting - ignorado"
            );
          }
        }}
        mode={competitionMode}
      />

      <GameResultModal
        isOpen={showResultModal}
        player1Score={scores.player1}
        player2Score={scores.player2}
        onBackToMenu={onBackToMenu}
      />

      <div className="min-h-screen bg-gradient-primary p-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              console.log("⬅️ Botão voltar clicado");
              if (
                window.confirm("Deseja sair do jogo? O progresso será perdido.")
              ) {
                onBackToMenu();
              }
            }}
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-4">
            {/* Placar Jogador 1 */}
            <Card
              className={cn(
                "bg-white/20 backdrop-blur-xl border-2",
                currentPlayer === 1
                  ? "border-blue-400 shadow-lg shadow-blue-400/50"
                  : "border-white/30"
              )}
            >
              <CardContent className="p-3">
                <div className="text-center">
                  <div className="text-xs text-white/70">Jogador 1</div>
                  <div className="text-2xl font-bold text-white">
                    {scores.player1}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Placar Jogador 2 */}
            <Card
              className={cn(
                "bg-white/20 backdrop-blur-xl border-2",
                currentPlayer === 2
                  ? "border-purple-400 shadow-lg shadow-purple-400/50"
                  : "border-white/30"
              )}
            >
              <CardContent className="p-3">
                <div className="text-center">
                  <div className="text-xs text-white/70">Jogador 2</div>
                  <div className="text-2xl font-bold text-white">
                    {scores.player2}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pergunta */}
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-lg border text-card-foreground backdrop-blur-lg bg-white/20 border-white/30 shadow-xl">
            <CardHeader className="flex flex-col space-y-1.5 p-4 sm:p-6">
              <CardTitle className="font-semibold tracking-tight text-lg sm:text-xl md:text-2xl text-center text-white leading-tight">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => {}}
                  disabled={!canAnswer || showAnswer}
                  className={cn(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:text-accent-foreground w-full h-auto min-h-[52px] sm:min-h-[60px] text-left justify-start p-3 sm:p-4 transition-all",
                    getButtonStyle(index),
                    !canAnswer && !showAnswer && "opacity-50 cursor-not-allowed"
                  )}
                  variant="ghost"
                >
                  <span className="font-semibold mr-2 sm:mr-3 text-base sm:text-lg flex-shrink-0">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="text-sm sm:text-base leading-tight">{option}</span>
                </Button>
              ))}

              {!canAnswer && !showAnswer && (
                <div className="text-center text-white/80 text-sm py-3 px-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  ⏳ Aguardando vencedor da competição...
                </div>
              )}

              {canAnswer && !showAnswer && currentPlayer && (
                <div className="text-center text-white font-semibold py-3 px-4 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 shadow-lg">
                  🎯 Jogador {currentPlayer}, use os botões A, B, C ou D para
                  responder!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
