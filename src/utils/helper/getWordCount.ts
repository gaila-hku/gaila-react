const getWordCount = (text: string | undefined) => {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;
};

export default getWordCount;
