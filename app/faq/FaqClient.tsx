'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  title: string;
  id: string;
  items: FaqItem[];
}

interface FaqClientProps {
  faqData: FaqSection[];
}

// 热门问题推荐
const popularQuestions: { question: string; sectionId: string; itemIndex: number }[] = [
  { question: 'Where are your products manufactured?', sectionId: 'products', itemIndex: 0 },
  { question: 'How do I care for my leather goods?', sectionId: 'products', itemIndex: 1 },
  { question: 'What is your return and exchange policy?', sectionId: 'returns', itemIndex: 0 },
  { question: 'How long does delivery take?', sectionId: 'delivery', itemIndex: 1 },
  { question: 'Do you offer complimentary gift wrapping?', sectionId: 'gifting', itemIndex: 0 },
  { question: 'How can I personalize my product?', sectionId: 'products', itemIndex: 2 },
];

export default function FaqClient({ faqData }: FaqClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<{ question: string; sectionId: string; itemIndex: number }[]>([]);

  // Debounce 搜索词
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 计算搜索建议（匹配问题标题，最多 8 条）
  useEffect(() => {
    if (!debouncedTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const matches: { question: string; sectionId: string; itemIndex: number }[] = [];

    faqData.forEach(section => {
      section.items.forEach((item, index) => {
        if (item.question && item.question.toLowerCase().includes(debouncedTerm.toLowerCase())) {
          matches.push({ question: item.question, sectionId: section.id, itemIndex: index });
        }
      });
    });

    setSuggestions(matches.slice(0, 8));
  }, [debouncedTerm, faqData]);

  // 高亮函数
  const highlightText = (text: string) => {
    if (!debouncedTerm) return text;
    const regex = new RegExp(`(${debouncedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-200 text-black">{part}</mark> : part
    );
  };

  // 总结果计数（添加安全检查）
  const totalResults = faqData.reduce((count, section) => {
    return count + section.items.filter(item =>
      (item.question && item.question.toLowerCase().includes(debouncedTerm.toLowerCase())) ||
      (item.answer && item.answer.toLowerCase().includes(debouncedTerm.toLowerCase()))
    ).length;
  }, 0);

  const hasResults = totalResults > 0;

  // 第一个匹配 ref
  const firstMatchRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (debouncedTerm && firstMatchRef.current) {
      firstMatchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [debouncedTerm]);

  // 展开/折叠所有
  const toggleAllInSection = (sectionId: string, expand: boolean) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (expand) newSet.add(sectionId);
      else newSet.delete(sectionId);
      return newSet;
    });
  };

  const isSectionExpanded = (sectionId: string) => expandedSections.has(sectionId);

  // 滚动到问题
  const scrollToQuestion = (sectionId: string, itemIndex: number) => {
    const element = document.querySelector(`#${sectionId} details:nth-of-type(${itemIndex + 1})`) as HTMLDetailsElement;
    if (element) {
      element.open = true;
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setSearchTerm(''); // 点击建议后清空搜索框
  };

  return (
    <>
      <style jsx global>{`
        /* 所有原有样式保持不变 */
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif; line-height: 1.8; color: #222; background-color: #fafafa; }
        .header { background: #fff; padding: 40px 0; text-align: center; border-bottom: 1px solid #eee; }
        .container { max-width: 1100px; margin: 60px auto; padding: 0 20px; }
        h1 { font-size: 2.8rem; font-weight: 300; letter-spacing: 3px; margin: 0; }
        .search-container { position: relative; text-align: center; margin-bottom: 2rem; }
        .search-box input { width: 100%; max-width: 700px; padding: 18px 50px 18px 25px; font-size: 1.2rem; border: 1px solid #ddd; outline: none; border-radius: 4px; }
        .search-box input:focus { border-color: #999; }
        .clear-button { position: absolute; right: calc(50% - 350px + 20px); top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.8rem; color: #999; cursor: pointer; }
        .clear-button:hover { color: #222; }
        @media (max-width: 768px) { .clear-button { right: 20px; } }
        .suggestions-dropdown { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: 100%; max-width: 700px; background: #fff; border: 1px solid #ddd; border-top: none; border-radius: 0 0 4px 4px; max-height: 400px; overflow-y: auto; z-index: 10; box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
        .suggestion-item { padding: 14px 25px; text-align: left; cursor: pointer; border-bottom: 1px solid #eee; transition: background 0.2s; }
        .suggestion-item:hover { background: #f9f9f9; }
        .suggestion-item:last-child { border-bottom: none; }
        .search-results { text-align: center; margin-bottom: 3rem; color: #666; font-size: 1.1rem; }
        .expand-all { text-align: center; margin-bottom: 2rem; }
        .expand-all button { background: none; border: none; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px; color: #666; cursor: pointer; text-decoration: underline; }
        .expand-all button:hover { color: #222; }
        .popular-questions { margin: 3rem 0 5rem; text-align: center; }
        .popular-title { font-size: 1.8rem; font-weight: 300; margin-bottom: 2.5rem; letter-spacing: 1px; }
        .popular-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; max-width: 1100px; margin: 0 auto; }
        .popular-card { background: #fff; padding: 1.8rem; border: 1px solid #eee; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-align: left; }
        .popular-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.1); transform: translateY(-6px); }
        .popular-card h3 { font-size: 1.15rem; font-weight: 500; margin: 0; line-height: 1.5; color: #222; }
        .categories { display: flex; flex-wrap: wrap; justify-content: center; gap: 40px; margin-bottom: 80px; font-size: 1.1rem; }
        .categories a { color: #222; text-decoration: none; padding: 10px 0; border-bottom: 2px solid transparent; font-weight: 500; }
        .categories a:hover, .categories a.active { border-bottom: 2px solid #222; }
        .faq-section { margin-bottom: 100px; }
        .faq-section h2 { font-size: 2rem; font-weight: 300; margin-bottom: 20px; text-align: center; letter-spacing: 1px; }
        details { background: #fff; margin-bottom: 20px; border: 1px solid #eee; padding: 25px; border-radius: 4px; overflow: hidden; }
        summary { font-size: 1.3rem; font-weight: 500; list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
        summary::after { content: "+"; font-size: 2rem; color: #999; }
        details[open] summary::after { content: "−"; }
        details p { margin: 25px 0 0; color: #444; line-height: 1.8; animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .no-results { text-align: center; font-size: 1.3rem; color: #666; margin: 60px 0; }
        .contact { text-align: center; padding: 80px 20px; background: #fff; border-top: 1px solid #eee; margin-top: 100px; }
        .contact p { font-size: 1.3rem; margin-bottom: 25px; }
        .contact a { color: #222; text-decoration: underline; }
      `}</style>

      {/* 搜索框 + Clear 按钮 + 搜索建议下拉 */}
      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords (e.g., “care”, “return”, “holiday gift”)"
            aria-label="Search FAQ"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="clear-button"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* 搜索建议下拉 */}
        {suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((sug, idx) => (
              <div
                key={idx}
                className="suggestion-item"
                onClick={() => scrollToQuestion(sug.sectionId, sug.itemIndex)}
              >
                {highlightText(sug.question)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 搜索结果计数 */}
      {debouncedTerm && (
        <div className="search-results">
          {hasResults ? (
            <>Found {totalResults} result{totalResults !== 1 ? 's' : ''} for “{debouncedTerm}”</>
          ) : (
            <>No results found for “{debouncedTerm}”. Try different keywords or browse the categories below.</>
          )}
        </div>
      )}

      {/* 热门问题推荐 */}
      {!debouncedTerm && (
        <div className="popular-questions">
          <div className="popular-title">Popular Questions</div>
          <div className="popular-grid">
            {popularQuestions.map((pq, idx) => (
              <div
                key={idx}
                className="popular-card"
                onClick={() => scrollToQuestion(pq.sectionId, pq.itemIndex)}
              >
                <h3>{pq.question}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 分类导航 */}
      <nav className="categories">
        {faqData.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            {section.title}
          </a>
        ))}
      </nav>

      {/* FAQ 内容 */}
      {faqData.map((section) => {
        const filteredItems = section.items.filter(item =>
          (item.question && item.question.toLowerCase().includes(debouncedTerm.toLowerCase())) ||
          (item.answer && item.answer.toLowerCase().includes(debouncedTerm.toLowerCase()))
        );

        if (debouncedTerm && filteredItems.length === 0) return null;

        const sectionExpanded = isSectionExpanded(section.id);

        return (
          <section key={section.id} id={section.id} className="faq-section">
            <h2>{section.title}</h2>

            {/* 展开/折叠所有按钮 */}
            <div className="expand-all">
              <button onClick={() => toggleAllInSection(section.id, !sectionExpanded)}>
                {sectionExpanded ? 'Collapse All' : 'Expand All'}
              </button>
            </div>

            {filteredItems.map((item, index) => {
              const isMatch =
                (item.question && item.question.toLowerCase().includes(debouncedTerm.toLowerCase())) ||
                (item.answer && item.answer.toLowerCase().includes(debouncedTerm.toLowerCase()));

              const detailsRef = (debouncedTerm && isMatch && index === 0)
                ? firstMatchRef
                : null;

              return (
                <details
                  key={index}
                  open={sectionExpanded || Boolean(debouncedTerm && isMatch)}  // 修复类型错误：用 Boolean 强制返回 boolean
                  ref={detailsRef}
                >
                  <summary>{highlightText(item.question || '')}</summary>
                  <p>{highlightText(item.answer || '')}</p>
                </details>
              );
            })}
          </section>
        );
      })}
    </>
  );
}