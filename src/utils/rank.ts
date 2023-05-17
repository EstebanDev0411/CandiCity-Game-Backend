export const rankArray = (arr) => {
  const sortedArr = [...arr].sort((a, b) => b - a);
  const rankArr = arr.map(value => {
    const rank = sortedArr.indexOf(value) + 1;
    return { value, rank };
  });
  return rankArr;
};
