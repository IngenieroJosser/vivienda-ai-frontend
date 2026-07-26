export function getCapacityRange(estimatedPayment: number): {
  minimum: number;
  maximum: number;
} | undefined {
  if (estimatedPayment <= 0) return undefined;
  const round = (value: number) => Math.round(value / 50_000) * 50_000;
  return {
    minimum: round(estimatedPayment * 0.85),
    maximum: round(estimatedPayment),
  };
}
