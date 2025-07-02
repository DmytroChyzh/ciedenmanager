interface PERTInput {
  optimistic: number;
  mostLikely: number;
  pessimistic: number;
}

interface PERTOutput {
  hours: number;
  price: number;
}

export function estimatePERT({ optimistic, mostLikely, pessimistic }: PERTInput): PERTOutput {
  // PERT Formula: (O + 4M + P) / 6
  const hours = (optimistic + 4 * mostLikely + pessimistic) / 6;
  
  // Assuming $50 per hour rate
  const price = hours * 50;

  return {
    hours,
    price,
  };
} 