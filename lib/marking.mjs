const stopWords = new Set(["about", "after", "also", "because", "between", "each", "from", "into", "more", "other", "strong", "structure", "than", "that", "their", "then", "there", "these", "they", "this", "through", "useful", "using", "when", "where", "which", "while", "with"]);

function tokens(text) {
  return String(text)
    .toLowerCase()
    .replace(/carbon dioxide/g, "co2")
    .replace(/hydrogen ions?/g, "proton")
    .replace(/concentration gradient/g, "gradient")
    .replace(/active sites?/g, "activesite")
    .replace(/enzyme.substrate complexes?/g, "escomplex")
    .replace(/hydrolys(?:is|ed)|hydroly[sz](?:e|ed|ing)/g, "hydrolyse")
    .replace(/phosphorylat(?:ion|ed|ing)/g, "phosphate")
    .replace(/transport proteins?|membrane pumps?/g, "pump")
    .replace(/conformations?|shapes?/g, "conformation")
    .replace(/solutes?|ions?/g, "particle")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/(ation|ments?|ingly|edly|ing|ed|es|s)$/i, ""))
    .filter((word) => word.length >= 3 && !stopWords.has(word));
}

export function gradeStructuredAnswer(markPoints, answer) {
  const answerTokens = new Set(tokens(answer));
  const pointTokens = markPoints.map((point) => [...new Set(tokens(point))]);
  const frequency = new Map();
  for (const point of pointTokens) for (const token of point) frequency.set(token, (frequency.get(token) ?? 0) + 1);

  const awardedPointIndexes = [];
  const evidence = pointTokens.map((allTokens, index) => {
    const distinctive = allTokens.filter((token) => (frequency.get(token) ?? 0) < Math.ceil(markPoints.length * 0.75));
    const expected = distinctive.length >= 2 ? distinctive : allTokens;
    const matched = expected.filter((token) => answerTokens.has(token));
    const minimum = expected.length === 1 ? 1 : expected.length <= 5 ? 2 : 3;
    const awarded = matched.length >= minimum && matched.length / expected.length >= 0.4;
    if (awarded) awardedPointIndexes.push(index);
    return { point: markPoints[index], awarded, matched };
  });

  return { awardedPointIndexes, evidence };
}
