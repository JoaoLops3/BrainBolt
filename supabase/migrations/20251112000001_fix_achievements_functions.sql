-- Fix achievements and characters functions to use correct profile fields
-- Replace references to non-existent fields with 'games_played'

CREATE OR REPLACE FUNCTION public.check_and_unlock_achievements(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
  achievement_record RECORD;
  character_record RECORD;
BEGIN
  -- Get user profile data
  SELECT * INTO user_profile FROM public.profiles WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check achievements
  FOR achievement_record IN 
    SELECT * FROM public.achievements WHERE NOT is_hidden
  LOOP
    CASE achievement_record.requirement_type
      WHEN 'total_score' THEN
        IF user_profile.total_score >= achievement_record.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
          VALUES (p_user_id, achievement_record.id, true, achievement_record.requirement_value)
          ON CONFLICT (user_id, achievement_id) DO UPDATE SET 
            is_completed = true, progress = achievement_record.requirement_value;
        END IF;
        
      WHEN 'games_played' THEN
        IF user_profile.games_played >= achievement_record.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
          VALUES (p_user_id, achievement_record.id, true, achievement_record.requirement_value)
          ON CONFLICT (user_id, achievement_id) DO UPDATE SET 
            is_completed = true, progress = achievement_record.requirement_value;
        END IF;
        
      WHEN 'multiplayer_games' THEN
        IF user_profile.games_played >= achievement_record.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
          VALUES (p_user_id, achievement_record.id, true, achievement_record.requirement_value)
          ON CONFLICT (user_id, achievement_id) DO UPDATE SET 
            is_completed = true, progress = achievement_record.requirement_value;
        END IF;
        
      WHEN 'survival_games' THEN
        IF user_profile.games_played >= achievement_record.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
          VALUES (p_user_id, achievement_record.id, true, achievement_record.requirement_value)
          ON CONFLICT (user_id, achievement_id) DO UPDATE SET 
            is_completed = true, progress = achievement_record.requirement_value;
        END IF;
        
      WHEN 'streak_count' THEN
        IF user_profile.best_streak >= achievement_record.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
          VALUES (p_user_id, achievement_record.id, true, achievement_record.requirement_value)
          ON CONFLICT (user_id, achievement_id) DO UPDATE SET 
            is_completed = true, progress = achievement_record.requirement_value;
        END IF;
        
      ELSE
        -- Unknown requirement type, skip
        NULL;
    END CASE;
  END LOOP;
  
  -- Check and unlock characters
  FOR character_record IN 
    SELECT * FROM public.characters
  LOOP
    CASE character_record.unlock_type
      WHEN 'default' THEN
        -- Default characters are always unlocked
        INSERT INTO public.user_characters (user_id, character_id)
        VALUES (p_user_id, character_record.id)
        ON CONFLICT (user_id, character_id) DO NOTHING;
        
      WHEN 'score' THEN
        -- Score-based characters
        IF user_profile.total_score >= character_record.unlock_requirement THEN
          INSERT INTO public.user_characters (user_id, character_id)
          VALUES (p_user_id, character_record.id)
          ON CONFLICT (user_id, character_id) DO NOTHING;
        END IF;
        
      WHEN 'games' THEN
        -- Games played based characters
        IF user_profile.games_played >= character_record.unlock_requirement THEN
          INSERT INTO public.user_characters (user_id, character_id)
          VALUES (p_user_id, character_record.id)
          ON CONFLICT (user_id, character_id) DO NOTHING;
        END IF;
        
      WHEN 'streak' THEN
        -- Streak-based characters
        IF user_profile.best_streak >= character_record.unlock_requirement THEN
          INSERT INTO public.user_characters (user_id, character_id)
          VALUES (p_user_id, character_record.id)
          ON CONFLICT (user_id, character_id) DO NOTHING;
        END IF;
        
      WHEN 'survival' THEN
        -- Survival mode characters
        IF user_profile.games_played >= character_record.unlock_requirement THEN
          INSERT INTO public.user_characters (user_id, character_id)
          VALUES (p_user_id, character_record.id)
          ON CONFLICT (user_id, character_id) DO NOTHING;
        END IF;
        
      WHEN 'multiplayer' THEN
        -- Multiplayer characters
        IF user_profile.games_played >= character_record.unlock_requirement THEN
          INSERT INTO public.user_characters (user_id, character_id)
          VALUES (p_user_id, character_record.id)
          ON CONFLICT (user_id, character_id) DO NOTHING;
        END IF;
        
      WHEN 'champion', 'legend', 'idol' THEN
        -- Legendary characters based on total games played
        IF user_profile.games_played >= character_record.unlock_requirement THEN
          INSERT INTO public.user_characters (user_id, character_id)
          VALUES (p_user_id, character_record.id)
          ON CONFLICT (user_id, character_id) DO NOTHING;
        END IF;
        
    END CASE;
  END LOOP;
END;
$$;

