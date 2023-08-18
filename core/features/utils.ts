export const computePercentDifferenceAndType = (A1: number, B1: number) => {
  const percentDifference = ((B1 - A1) / A1) * 100;

  if (percentDifference > 0) {
    return { percent: Math.abs(percentDifference), type: 'increase' };
  } else if (percentDifference < 0) {
    return { percent: Math.abs(percentDifference), type: 'decrease' };
  } else {
    return { percent: 0, type: 'none' };
  }
};
