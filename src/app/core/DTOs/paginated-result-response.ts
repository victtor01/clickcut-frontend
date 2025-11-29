export interface PaginatedResult<T> {
  items: T[];        // lista de itens da página
  totalItems: number; // total de itens encontrados
  page: number;       // página atual
  pageSize: number;   // tamanho da página
  totalPages: number; // total de páginas
}