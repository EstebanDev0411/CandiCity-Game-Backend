export const getRandomArbitrary = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const generateUID = () => {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  const firstNum = (Math.random() * 46656) | 0;
  const secondNum = (Math.random() * 46656) | 0;
  const firstPart = ("000" + firstNum.toString(36)).slice(-3);
  const secondPart = ("000" + secondNum.toString(36)).slice(-3);
  return firstPart + secondPart;
};
