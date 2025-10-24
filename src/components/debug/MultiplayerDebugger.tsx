import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const MultiplayerDebugger = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testRoomSearch = async () => {
    if (!roomCode.trim()) return;

    setLoading(true);
    try {
      console.log("🔍 Testando busca de sala...");

      // Test 1: Search for room
      const { data: rooms, error: fetchError } = await supabase
        .from("multiplayer_rooms")
        .select("*")
        .eq("room_code", roomCode.trim().toUpperCase())
        .eq("game_status", "waiting")
        .is("guest_id", null)
        .limit(1);

      console.log("📊 Resultado da busca:", { rooms, fetchError });

      setDebugInfo({
        searchResult: { rooms, fetchError },
        timestamp: new Date().toISOString(),
      });

      if (fetchError) {
        toast({
          title: "Erro na busca",
          description: fetchError.message,
          variant: "destructive",
        });
        return;
      }

      if (!rooms || rooms.length === 0) {
        toast({
          title: "Sala não encontrada",
          description: "Nenhuma sala disponível com este código",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sala encontrada!",
        description: `Sala ID: ${rooms[0].id}`,
      });
    } catch (error) {
      console.error("❌ Erro no teste:", error);
      toast({
        title: "Erro no teste",
        description: "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testCreateRoom = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const testCode = `TEST${Math.random()
        .toString(36)
        .substr(2, 4)
        .toUpperCase()}`;

        const { data, error } = await supabase
          .from("multiplayer_rooms")
          .insert({
            room_code: testCode,
            host_id: user.id,
          })
          .select()
          .single();

      if (error) {
        toast({
          title: "Erro ao criar sala de teste",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setRoomCode(testCode);
      toast({
        title: "Sala de teste criada!",
        description: `Código: ${testCode}`,
      });
    } catch (error) {
      console.error("❌ Erro ao criar sala de teste:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🐛 Debug Multiplayer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Código da sala"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              onClick={testRoomSearch}
              disabled={loading || !roomCode.trim()}
              className="flex-1"
            >
              Testar Busca
            </Button>
            <Button
              onClick={testCreateRoom}
              disabled={loading || !user}
              variant="outline"
            >
              Criar Teste
            </Button>
          </div>
        </div>

        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
