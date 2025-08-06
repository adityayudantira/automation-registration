const stringSimilarity = require("string-similarity");

/**
 * Fuzzy match dan suggestion
 * @param {string} input - teks input
 * @param {Array<{nama: string, kode: string}>} options - daftar pilihan
 * @param {boolean} returnBestMatch - apakah mengembalikan match terbaik
 * @returns {{ match: object|null, suggestions: string[] }}
 */
function getSuggestions(input, options, returnBestMatch = false) {
  const names = options.map(o => o.nama.toLowerCase());
  const result = stringSimilarity.findBestMatch(input.toLowerCase(), names);
  const bestMatch = result.bestMatch;

  if (bestMatch.rating >= 0.6) {
    const matched = options.find(o => o.nama.toLowerCase() === bestMatch.target);
    return { match: matched || null, suggestions: [] };
  }

  // Jika tidak cocok, kembalikan suggestion
  const suggestions = result.ratings
    .filter(r => r.rating >= 0.3)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)
    .map(r => r.target);

  return { match: returnBestMatch ? null : null, suggestions };
}

module.exports = { getSuggestions };
