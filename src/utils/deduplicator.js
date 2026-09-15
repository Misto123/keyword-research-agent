/**
 * Deduplicate keywords using multiple strategies
 */
export class KeywordDeduplicator {
  /**
   * Remove exact duplicates and normalize keywords
   */
  removeDuplicates(keywords) {
    const seen = new Map();
    const unique = [];

    for (const kw of keywords) {
      const normalized = this.normalize(kw.keyword);
      
      if (!seen.has(normalized)) {
        seen.set(normalized, kw);
        unique.push(kw);
      } else {
        // Keep the one with higher volume
        const existing = seen.get(normalized);
        if ((kw.volume || 0) > (existing.volume || 0)) {
          seen.set(normalized, kw);
          const index = unique.indexOf(existing);
          unique[index] = kw;
        }
      }
    }

    return unique;
  }

  /**
   * Normalize keyword for comparison
   */
  normalize(keyword) {
    return keyword
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Find near-duplicates (different word order, minor variations)
   */
  findNearDuplicates(keywords) {
    const groups = new Map();

    for (const kw of keywords) {
      const signature = this.createSignature(kw.keyword);
      
      if (!groups.has(signature)) {
        groups.set(signature, []);
      }
      groups.get(signature).push(kw);
    }

    // Return only groups with multiple items
    return Array.from(groups.values()).filter(g => g.length > 1);
  }

  /**
   * Create signature for near-duplicate detection
   */
  createSignature(keyword) {
    const words = this.normalize(keyword).split(' ').sort();
    return words.join('_');
  }

  /**
   * Merge near-duplicate groups, keeping the best variant
   */
  mergeNearDuplicates(keywords) {
    const nearDupes = this.findNearDuplicates(keywords);
    const toRemove = new Set();

    for (const group of nearDupes) {
      // Sort by volume descending
      group.sort((a, b) => (b.volume || 0) - (a.volume || 0));
      
      // Keep first (highest volume), mark others for removal
      for (let i = 1; i < group.length; i++) {
        toRemove.add(group[i].keyword);
      }
    }

    return keywords.filter(kw => !toRemove.has(kw.keyword));
  }

  /**
   * Calculate similarity between two keywords
   */
  similarity(kw1, kw2) {
    const words1 = new Set(this.normalize(kw1).split(' '));
    const words2 = new Set(this.normalize(kw2).split(' '));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
}
