export function stroopsToXlm(stroops: bigint): string {
  const negative = stroops < 0n;
  const absolute = negative ? -stroops : stroops;
  const whole = absolute / 10_000_000n;
  const fraction = String(absolute % 10_000_000n).padStart(7, "0");
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}
