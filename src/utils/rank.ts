export const rankArray = (arr: BigInt[]): { value: BigInt, rank: number }[] => {
  const sortedArr = [...arr].sort((a, b) => (b as any).compare(a));
  const rankArr = arr.map(value => {
    const rank = sortedArr.indexOf(value) + 1;
    return { value, rank };
  });
  return rankArr;
};