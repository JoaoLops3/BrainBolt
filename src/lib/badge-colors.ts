export function getBadgeClassesFromLabel(label: string) {
  const key = (label || "").trim().toLowerCase();
  switch (key) {
    case "diamond":
    case "diamante":
      return "bg-[#22d3ee] text-white hover:bg-[#22d3ee]/90";
    case "rainbow":
    case "arco-iris":
    case "arcoíris":
    case "arcoiris":
      return "bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 text-white hover:opacity-90";
    case "gold":
    case "dourado":
      return "bg-yellow-500 text-white hover:bg-yellow-500/80";
    case "silver":
    case "prata":
      return "bg-gray-400 text-white hover:bg-gray-400/80";
    case "bronze":
      return "bg-amber-700 text-white hover:bg-amber-700/80";
    case "green":
    case "verde":
      return "bg-green-500 text-white hover:bg-green-500/80";
    case "blue":
    case "azul":
      return "bg-blue-500 text-white hover:bg-blue-500/80";
    case "amber":
    case "amarelo":
      return "bg-amber-500 text-white hover:bg-amber-500/80";
    case "purple":
    case "roxo":
      return "bg-purple-500 text-white hover:bg-purple-500/80";
    case "pink":
    case "rosa":
      return "bg-pink-500 text-white hover:bg-pink-500/80";
    case "orange":
    case "laranja":
      return "bg-orange-500 text-white hover:bg-orange-500/80";
    case "red":
    case "vermelho":
      return "bg-red-500 text-white hover:bg-red-500/80";
    case "yellow":
      return "bg-yellow-500 text-white hover:bg-yellow-500/80";
    default:
      return "bg-black text-white hover:bg-black/80";
  }
}
