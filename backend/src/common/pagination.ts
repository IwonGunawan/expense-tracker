export function pageInfo(total: number, page: number, limit: number) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(1, page), pages);
  return {
    total,
    page: currentPage,
    limit,
    pages,
    hasNext: currentPage < pages,
    hasPrev: currentPage > 1,
  };
}
