import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.log("Current path:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 no-scroll px-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="mb-4 text-6xl md:text-8xl font-bold text-gray-800">
          404
        </h1>
        <p className="mb-6 text-lg md:text-xl text-gray-600">
          Oops! Página não encontrada
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 text-blue-500 underline hover:text-blue-700 transition-colors duration-200 text-base md:text-lg"
        >
          Voltar para o Início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
