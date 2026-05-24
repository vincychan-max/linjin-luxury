import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string; // 例如: '/men' 或 '/women'
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  // 安全性检查：如果只有一页或无数据，不渲染任何内容
  if (totalPages <= 1) return null;

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  // 辅助函数：生成干净的 URL
  // 如果页码是 1，返回 baseUrl (例如 /women)
  // 如果页码 > 1，返回带参数的 URL (例如 /women?page=2)
  const getPageHref = (page: number) => {
    return page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
  };

  return (
    <div className="flex justify-center items-center gap-8 py-16 text-[10px] uppercase tracking-[0.3em]">
      
      {/* 上一页 */}
      <Link 
        href={isFirstPage ? '#' : getPageHref(currentPage - 1)}
        aria-disabled={isFirstPage}
        className={`transition-opacity duration-300 ${
          isFirstPage 
            ? 'opacity-20 cursor-not-allowed' 
            : 'text-black hover:text-black/50'
        }`}
      >
        Previous
      </Link>

      {/* 分隔符 */}
      <span className="text-black/20">/</span>

      {/* 当前页码 */}
      <span className="text-black font-medium">
        {currentPage} <span className="text-gray-300 font-normal">of {totalPages}</span>
      </span>

      {/* 分隔符 */}
      <span className="text-black/20">/</span>

      {/* 下一页 */}
      <Link 
        href={isLastPage ? '#' : getPageHref(currentPage + 1)}
        aria-disabled={isLastPage}
        className={`transition-opacity duration-300 ${
          isLastPage 
            ? 'opacity-20 cursor-not-allowed' 
            : 'text-black hover:text-black/50'
        }`}
      >
        Next
      </Link>
    </div>
  );
}