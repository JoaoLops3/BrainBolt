import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ControlledSpinner } from "@/components/ui/ControlledSpinner";
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
  return (
    colorMap[category as keyof typeof colorMap] || "bg-gray-100 text-gray-800"
  );
};

export const CharactersModal = ({
  open,
  onOpenChange,
}: CharactersModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userCharacters, setUserCharacters] = useState<UserCharacter[]>([]);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCharacters = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

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
      const { data: userCharactersData, error: userCharactersError } =
        await supabase
          .from("user_characters")
          .select(
            `
          *,
          character:characters(*)
        `
          )
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
      const userCharacter = userCharacters.find(
        (uc) => uc.character_id === characterId
      );
      if (!userCharacter) return;

      const { error } = await supabase
        .from("user_characters")
        .update({ is_favorite: !userCharacter.is_favorite })
        .eq("id", userCharacter.id);

      if (error) throw error;

      setUserCharacters((prev) =>
        prev.map((uc) =>
          uc.id === userCharacter.id
            ? { ...uc, is_favorite: !uc.is_favorite }
            : uc
        )
      );

      toast({
        title: userCharacter.is_favorite
          ? "Removido dos favoritos"
          : "Adicionado aos favoritos",
        description: `${userCharacter.character.name} ${
          userCharacter.is_favorite ? "removido dos" : "adicionado aos"
        } favoritos`,
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
    if (open && user) {
      fetchCharacters();
    } else if (!open) {
      // Reset loading state when modal closes
      setLoading(false);
    }
  }, [open, user]);

  const unlockedCharacters = userCharacters;
  const lockedCharacters = allCharacters.filter(
    (c) => !userCharacters.some((uc) => uc.character_id === c.id)
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

  const renderCharacterCard = (
    character: Character,
    userCharacter?: UserCharacter,
    isLocked = false
  ) => {
    const RarityIcon = getRarityIcon(character.rarity);

    return (
      <Card
        key={character.id}
        className={`transition-transform duration-200 hover:scale-[1.02] hover:shadow-md backdrop-blur-sm bg-white/5 border-white/20 ${
          isLocked ? "opacity-60" : ""
        } h-fit border-2 hover:border-white/40`}
      >
        <CardHeader className="pb-3 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
                <AvatarImage
                  src={character.image_url}
                  alt={character.name}
                  className={isLocked ? "filter grayscale" : ""}
                />
                <AvatarFallback className="text-sm font-semibold">
                  {isLocked ? (
                    <Lock className="h-6 w-6" />
                  ) : (
                    character.name.charAt(0)
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm sm:text-base font-semibold leading-tight mb-2 text-white">
                  {character.name}
                </CardTitle>
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`${getCategoryColor(
                      character.category
                    )} text-xs`}
                  >
                    {character.category}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`${getRarityColor(character.rarity)} text-xs`}
                  >
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
                className={`flex-shrink-0 h-8 w-8 p-0 ${
                  userCharacter.is_favorite
                    ? "text-red-500 hover:text-red-700"
                    : "text-gray-400 hover:text-red-500"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${
                    userCharacter.is_favorite ? "fill-current" : ""
                  }`}
                />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            {character.description}
          </p>

          {character.special_ability && (
            <div className="bg-white/5 border border-white/20 p-3 rounded-lg backdrop-blur-sm">
              <p className="text-xs font-semibold text-white mb-1">
                Habilidade Especial:
              </p>
              <p className="text-xs text-white/80">
                {character.special_ability}
              </p>
            </div>
          )}

          {isLocked ? (
            <div className="flex items-center gap-2 text-white/80 bg-white/5 p-2 rounded-lg backdrop-blur-sm">
              <Target className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs">
                Acerte {character.unlock_requirement} perguntas de{" "}
                {character.category}
              </span>
            </div>
          ) : (
            userCharacter && (
              <div className="flex items-center gap-2 text-green-300 bg-green-500/20 p-2 rounded-lg backdrop-blur-sm">
                <Trophy className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs font-medium">
                  Desbloqueado em{" "}
                  {new Date(userCharacter.unlocked_at).toLocaleDateString(
                    "pt-BR"
                  )}
                </span>
              </div>
            )
          )}
        </CardContent>
      </Card>
    );
  };

  const collectionRate =
    allCharacters.length > 0
      ? Math.round((unlockedCharacters.length / allCharacters.length) * 100)
      : 0;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="6xl"
      maxHeight="screen"
    >
      <div className="flex flex-col h-[90vh] max-h-[90vh]">
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 text-base sm:text-lg text-white">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            Coleção de Personagens
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/80">
            <span>
              {unlockedCharacters.length}/{allCharacters.length} coletados
            </span>
            <span>{collectionRate}% completo</span>
          </div>
        </div>

        <Tabs
          defaultValue="unlocked"
          className="w-full flex flex-col flex-1 min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2 h-10 flex-shrink-0 bg-white/20 backdrop-blur-lg border-white/30 p-1">
            <TabsTrigger
              value="unlocked"
              className="text-xs sm:text-sm text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-sm"
            >
              Coletados ({unlockedCharacters.length})
            </TabsTrigger>
            <TabsTrigger
              value="locked"
              className="text-xs sm:text-sm text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-sm"
            >
              Bloqueados ({lockedCharacters.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="unlocked"
            className="mt-4 flex-1 overflow-y-auto min-h-0"
          >
            {loading && allCharacters.length === 0 ? (
              <ControlledSpinner
                isLoading={loading}
                label="Carregando personagens..."
                size="md"
              />
            ) : unlockedCharacters.length === 0 ? (
              <div className="text-center py-12 text-white/80">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  Nenhum personagem coletado ainda
                </p>
                <p className="text-sm">
                  Acerte perguntas por categoria para desbloquear personagens!
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedUnlocked).map(
                  ([category, characters]) => (
                    <div key={category} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg sm:text-xl font-bold capitalize text-white">
                          {category}
                        </h3>
                        <Badge
                          variant="outline"
                          className={getCategoryColor(category)}
                        >
                          {characters.length} personagem
                          {characters.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div
                        className={`grid gap-4 ${
                          characters.length === 1
                            ? "grid-cols-1 max-w-sm mx-auto"
                            : characters.length === 2
                            ? "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
                        }`}
                      >
                        {characters.map((uc) =>
                          renderCharacterCard(uc.character, uc)
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="locked"
            className="mt-4 flex-1 overflow-y-auto min-h-0"
          >
            {loading && allCharacters.length === 0 ? (
              <ControlledSpinner
                isLoading={loading}
                label="Carregando personagens..."
                size="md"
              />
            ) : lockedCharacters.length === 0 ? (
              <div className="text-center py-12 text-white/80">
                <Crown className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  Todos os personagens foram coletados!
                </p>
                <p className="text-sm">Você completou a coleção!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedLocked).map(([category, characters]) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg sm:text-xl font-bold capitalize text-white">
                        {category}
                      </h3>
                      <Badge
                        variant="outline"
                        className={getCategoryColor(category)}
                      >
                        {characters.length} personagem
                        {characters.length !== 1 ? "s" : ""} bloqueado
                        {characters.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <div
                      className={`grid gap-4 ${
                        characters.length === 1
                          ? "grid-cols-1 max-w-sm mx-auto"
                          : characters.length === 2
                          ? "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto"
                          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
                      }`}
                    >
                      {characters.map((character) =>
                        renderCharacterCard(character, undefined, true)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveDialog>
  );
};
