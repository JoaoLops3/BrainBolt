import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InteractiveTutorial } from "./InteractiveTutorial";

export const TutorialTrigger = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  const handleComplete = () => {
    setShowTutorial(false);
    localStorage.setItem("brainbolt-tutorial-completed", "true");
  };

  const handleSkip = () => {
    setShowTutorial(false);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowTutorial(true)}
              className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 shadow-lg bg-purple-500 text-white hover:bg-purple-600 border-purple-600 hover:border-purple-700 h-12 w-12 sm:h-14 sm:w-14 rounded-full safe-bottom safe-right"
            >
              <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs sm:text-sm">Ver Tutorial</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showTutorial && (
        <InteractiveTutorial onComplete={handleComplete} onSkip={handleSkip} />
      )}
    </>
  );
};
