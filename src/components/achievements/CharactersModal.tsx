import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Star,
  Lock,
  Heart,
  Target,
  Trophy,
  Crown,
  Gem,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Character {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  rarity: string;
  unlock_requirement: number;
  special_ability: string;
}

interface UserCharacter {
  id: string;
  character_id: string;
  unlocked_at: string;
  is_favorite: boolean;
  character: Character;
}

interface CharactersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getRarityColor = (rarity: string) => {
  const colorMap = {
    common: "text-gray-600 bg-gray-100",
    rare: "text-blue-600 bg-blue-100",
    epic: "text-purple-600 bg-purple-100",
    legendary: "text-yellow-600 bg-yellow-100",
  };
  return colorMap[rarity as keyof typeof colorMap] || colorMap.common;
};

const getRarityIcon = (rarity: string) => {
  const iconMap = {
    common: Star,
    rare: Gem,
    epic: Crown,
    legendary: Sparkles,
  };
  return iconMap[rarity as keyof typeof iconMap] || Star;
};

const getCategoryColor = (category: string) => {
  const colorMap = {
    sports: "bg-green-100 text-green-800",
    science: "bg-blue-100 text-blue-800",
    geography: "bg-orange-100 text-orange-800",
    art: "bg-purple-100 text-purple-800",
    history: "bg-amber-100 text-amber-800",
    entertainment: "bg-pink-100 text-pink-800",
  };
  return colorMap[category as keyof typeof colorMap] || "bg-gray-100 text-gray-800";
};

export const CharactersModal = ({ open, onOpenChange }: CharactersModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userCharacters, setUserCharacters] = useState<UserCharacter[]>([]);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCharacters = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all characters
      const { data: characters, error: charactersError } = await supabase
        .from("characters")
        .select("*")
        .order("category", { ascending: true });

      if (charactersError) throw charactersError;

      setAllCharacters(characters || []);

      // Fetch user characters
      const { data: userCharactersData, error: userCharactersError } = await supabase
        .from("user_characters")
        .select(`
          *,
          character:characters(*)
        `)
        .eq("user_id", user.id);

      if (userCharactersError) throw userCharactersError;

      setUserCharacters(userCharactersData || []);
    } catch (error) {
      console.error("Error fetching characters:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os personagens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (characterId: string) => {
    if (!user) return;

    try {
      const userCharacter = userCharacters.find(uc => uc.character_id === characterId);
      if (!userCharacter) return;

      const { error } = await supabase
        .from("user_characters")
        .update({ is_favorite: !userCharacter.is_favorite })
        .eq("id", userCharacter.id);

      if (error) throw error;

      setUserCharacters(prev => prev.map(uc => 
        uc.id === userCharacter.id 
          ? { ...uc, is_favorite: !uc.is_favorite }
          : uc
      ));

      toast({
        title: userCharacter.is_favorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: `${userCharacter.character.name} ${userCharacter.is_favorite ? 'removido dos' : 'adicionado aos'} favoritos`,
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar favorito",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchCharacters();
    }
  }, [open, user]);

  const unlockedCharacters = userCharacters;
  const lockedCharacters = allCharacters.filter(c => 
    !userCharacters.some(uc => uc.character_id === c.id)
  );

  const groupedUnlocked = unlockedCharacters.reduce((groups, uc) => {
    const category = uc.character.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(uc);
    return groups;
  }, {} as Record<string, UserCharacter[]>);

  const groupedLocked = lockedCharacters.reduce((groups, char) => {
    const category = char.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(char);
    return groups;
  }, {} as Record<string, Character[]>);

  const renderCharacterCard = (character: Character, userCharacter?: UserCharacter, isLocked = false) => {
    const RarityIcon = getRarityIcon(character.rarity);

    return (
      <Card key={character.id} className={`transition-all hover:scale-105 ${isLocked ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={character.image_url} 
                  alt={character.name}
                  className={isLocked ? "filter grayscale" : ""}
                />
                <AvatarFallback>
                  {isLocked ? <Lock className="h-6 w-6" /> : character.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm">{character.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className={getCategoryColor(character.category)}>
                    {character.category}
                  </Badge>
                  <Badge variant="secondary" className={getRarityColor(character.rarity)}>
                    <RarityIcon className="h-3 w-3 mr-1" />
                    {character.rarity}
                  </Badge>
                </div>
              </div>
            </div>
            {userCharacter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(character.id)}
                className={userCharacter.is_favorite ? "text-red-500 hover:text-red-700" : "text-gray-400 hover:text-red-500"}
              >
                <Heart className={`h-4 w-4 ${userCharacter.is_favorite ? 'fill-current' : ''}`} />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">{character.description}</p>
          
          {character.special_ability && (
            <div className="bg-primary/5 p-2 rounded-lg mb-2">
              <p className="text-xs font-medium text-primary">Habilidade Especial:</p>
              <p className="text-xs">{character.special_ability}</p>
            </div>
          )}

          {isLocked ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="text-xs">
                Acerte {character.unlock_requirement} perguntas de {character.category}
              </span>
            </div>
          ) : (
            userCharacter && (
              <div className="flex items-center gap-1 text-green-600">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Desbloqueado em {new Date(userCharacter.unlocked_at).toLocaleDateString()}
                </span>
              </div>
            )
          )}
        </CardContent>
      </Card>
    );
  };

  const collectionRate = allCharacters.length > 0 
    ? Math.round((unlockedCharacters.length / allCharacters.length) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Coleção de Personagens
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{unlockedCharacters.length}/{allCharacters.length} coletados</span>
            <span>{collectionRate}% completo</span>
          </div>
        </DialogHeader>

        <Tabs defaultValue="unlocked" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unlocked">
              Coletados ({unlockedCharacters.length})
            </TabsTrigger>
            <TabsTrigger value="locked">
              Bloqueados ({lockedCharacters.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unlocked" className="mt-4">
            {unlockedCharacters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum personagem coletado ainda</p>
                <p className="text-sm">Acerte perguntas por categoria para desbloquear personagens!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedUnlocked).map(([category, characters]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3 capitalize">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {characters.map(uc => 
                        renderCharacterCard(uc.character, uc)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="locked" className="mt-4">
            {lockedCharacters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Todos os personagens foram coletados!</p>
                <p className="text-sm">Você completou a coleção!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedLocked).map(([category, characters]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3 capitalize">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {characters.map(character => 
                        renderCharacterCard(character, undefined, true)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};