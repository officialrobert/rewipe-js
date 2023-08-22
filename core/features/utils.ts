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

export const readableMemory = (memoryInBytes: number = 0): string => {
  if (memoryInBytes >= 1e6) {
    return `${(memoryInBytes / 1e6).toFixed(2)} Mb`;
  } else if (memoryInBytes > 100) {
    return `${(memoryInBytes / 1_000).toFixed(2)} Kb`;
  } else {
    return `${memoryInBytes} bytes`;
  }
};
