export const bigIntToNumber = (bigIntValue: bigint): number => {
  return Number(bigIntValue);
};

export const calculateGas = (gasLimit: BigInt, gasPrice: BigInt): number => {
  const maxGasFeeInWei = Number(gasLimit) * Number(gasPrice);
  return maxGasFeeInWei / 1e18;
};
