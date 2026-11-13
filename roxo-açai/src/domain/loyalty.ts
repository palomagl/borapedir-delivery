export const LOYALTY_TARGET = 10;
export function loyaltyProgress(completedOrders: number, usedRewards: number) {
  const completed = Math.max(0, Math.floor(completedOrders));
  return { completed, stamps: completed % LOYALTY_TARGET, target: LOYALTY_TARGET, available: Math.max(0, Math.floor(completed / LOYALTY_TARGET) - Math.max(0, usedRewards)) };
}
export interface LoyaltyState { joined: boolean; completed: number; stamps: number; target: number; available: number; demo: boolean }
