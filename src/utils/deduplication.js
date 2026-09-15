/**
 * Deduplication and normalization utilities
 */

export function normalizeKeyword(keyword) {
  return keyword
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '');
}

export function calculateSimilarity(str1, str2) {
  const words1 = new Set(str1.toLowerCase().split(' '));
  const words2 = new Set(str2.toLowerCase().split(' '));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

export function deduplicateKeywords(keywords) {
  const seen = new Map();
  const duplicates = [];
  
  for (const kw of keywords) {
    const normalized = normalizeKeyword(kw.keyword);
    
    if (seen.has(normalized)) {
      const existing = seen.get(normalized);
      // Keep the one with higher volume
      if (kw.volume > existing.volume) {
        duplicates.push(existing);
        seen.set(normalized, kw);
      } else {
        duplicates.push(kw);
      }
    } else {
      seen.set(normalized, kw);
    }
  }
  
  return {
    unique: Array.from(seen.values()),
    duplicates
  };
}

export function findNearDuplicates(keywords, threshold = 0.8) {
  const groups = [];
  const processed = new Set();
  
  for (let i = 0; i < keywords.length; i++) {
    if (processed.has(i)) continue;
    
    const group = [keywords[i]];
    processed.add(i);
    
    for (let j = i + 1; j < keywords.length; j++) {
      if (processed.has(j)) continue;
      
      const similarity = calculateSimilarity(
        keywords[i].keyword,
        keywords[j].keyword
      );
      
      if (similarity >= threshold) {
        group.push(keywords[j]);
        processed.add(j);
      }
    }
    
    if (group.length > 1) {
      // Sort by volume and keep the primary
      group.sort((a, b) => b.volume - a.volume);
      groups.push({
        primary: group[0],
        variants: group.slice(1)
      });
    }
  }
  
  return groups;
}

export function removeSemanticDuplicates(keywords, llmService) {
  // For large lists, this would use embeddings
  // For now, we use word-overlap heuristics
  return deduplicateKeywords(keywords);
}
