const shortenString = (
  str: string | undefined,
  maxLength: number = 60,
): string => {
  if (!str) {
    return '';
  }
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + '...';
};

export default shortenString;
