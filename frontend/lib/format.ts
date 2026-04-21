export const BUS_FARE = Number(process.env.NEXT_PUBLIC_FARE || 20);

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDateTime(input: string): string {
  return new Date(input).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function shortId(id: string, start = 6, end = 4): string {
  if (id.length <= start + end) {
    return id;
  }

  return `${id.slice(0, start)}...${id.slice(-end)}`;
}
