import { getFaqs } from '../repositories/faq.repository.js';

export function searchKnowledgeBase({ query }) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return { results: [], message: 'A non-empty query string is required.' };
  }

  const rawFaqs = getFaqs();
  const faqs = rawFaqs.map((faq) => ({
    id: faq.id,
    category: faq.category,
    question: faq.title,
    answer: faq.content,
    keywords: faq.tags,
  }));

  const normalizedQuery = query.toLowerCase().trim();
  const tokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 2);

  const scored = faqs.map((faq) => {
    const haystack = [
      faq.question.toLowerCase(),
      faq.answer.toLowerCase(),
      ...(faq.keywords || []).map((k) => k.toLowerCase()),
    ];
    const joined = haystack.join(' | ');

    let score = 0;

    // Full substring match bonus (semantic-ish: whole phrase present)
    if (joined.includes(normalizedQuery)) {
      score += 5;
    }

    // Token overlap scoring
    for (const token of tokens) {
      if (joined.includes(token)) {
        score += 1;
      }
    }

    return { faq, score };
  });

  const results = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => ({
      id: s.faq.id,
      category: s.faq.category,
      question: s.faq.question,
      answer: s.faq.answer,
      relevanceScore: s.score,
    }));

  return {
    query,
    resultCount: results.length,
    results,
  };
}
