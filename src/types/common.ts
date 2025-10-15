// Tipos comuns para reduzir uso de 'any'
export type DatabaseError = {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
};

export type ApiResponse<T = any> = {
  data?: T;
  error?: DatabaseError;
};

export type LoadingState = "idle" | "loading" | "success" | "error";

export type PaginationParams = {
  page?: number;
  limit?: number;
  offset?: number;
};

export type SortParams = {
  field: string;
  direction: "asc" | "desc";
};

export type FilterParams = {
  [key: string]: string | number | boolean | null;
};

// Utility type para extrair tipos de arrays
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Utility type para tornar propriedades opcionais
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Utility type para tornar propriedades obrigatórias
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
