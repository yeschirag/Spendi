import { describe, it, expect } from 'vitest';

// Function containing the core splitting logic isolated for pure testing
function calculateSplit({ amount, splitWith, splitType, splitsData, paidBy }) {
  if (!amount || amount <= 0 || !splitWith || splitWith.length === 0) {
    return [];
  }

  return splitWith.map(friendName => {
    let amount_owed = 0;
    if (splitType === 'equal') {
      amount_owed = Number((amount / splitWith.length).toFixed(2));
    } else if (splitsData && splitsData[friendName] !== undefined) {
      if (splitType === 'percentage') {
        amount_owed = Number((amount * (parseFloat(splitsData[friendName]) / 100)).toFixed(2));
      } else {
        amount_owed = Number(splitsData[friendName]);
      }
    }

    return {
      name: friendName,
      amount_owed,
      amount_paid: friendName === paidBy ? amount : 0
    };
  });
}

// Function to validate split total consistency
function validateSplitTotals({ amount, splitWith, splitType, splitsData }) {
  if (!amount || !splitWith || splitWith.length === 0) return false;
  
  const getSplitTotal = () => {
    return splitWith.reduce((sum, f) => sum + parseFloat(splitsData[f] || 0), 0);
  };

  if (splitType === 'percentage') {
    return Math.abs(getSplitTotal() - 100) < 0.1;
  } else if (splitType === 'exact') {
    return Math.abs(getSplitTotal() - parseFloat(amount)) < 0.01;
  }
  return true;
}

describe('Split Calculations Logic', () => {
  describe('Equal Split Type', () => {
    it('divides amount equally among participants', () => {
      const result = calculateSplit({
        amount: 300,
        splitWith: ['You', 'Alice', 'Bob'],
        splitType: 'equal',
        paidBy: 'You'
      });

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ name: 'You', amount_owed: 100, amount_paid: 300 });
      expect(result[1]).toEqual({ name: 'Alice', amount_owed: 100, amount_paid: 0 });
      expect(result[2]).toEqual({ name: 'Bob', amount_owed: 100, amount_paid: 0 });
    });

    it('handles floating point division and correct rounding', () => {
      const result = calculateSplit({
        amount: 100,
        splitWith: ['You', 'Alice', 'Bob'],
        splitType: 'equal',
        paidBy: 'You'
      });

      // 100 / 3 = 33.33333... -> 33.33
      expect(result[0].amount_owed).toBe(33.33);
      expect(result[1].amount_owed).toBe(33.33);
      expect(result[2].amount_owed).toBe(33.33);
    });

    it('returns empty list if amount is zero or negative', () => {
      const result = calculateSplit({
        amount: 0,
        splitWith: ['You', 'Alice'],
        splitType: 'equal',
        paidBy: 'You'
      });
      expect(result).toEqual([]);
    });

    it('returns empty list if splitWith is empty', () => {
      const result = calculateSplit({
        amount: 100,
        splitWith: [],
        splitType: 'equal',
        paidBy: 'You'
      });
      expect(result).toEqual([]);
    });
  });

  describe('Percentage Split Type', () => {
    it('calculates custom amounts owed based on percentages', () => {
      const result = calculateSplit({
        amount: 500,
        splitWith: ['You', 'Alice'],
        splitType: 'percentage',
        splitsData: { 'You': '60', 'Alice': '40' },
        paidBy: 'You'
      });

      expect(result[0].amount_owed).toBe(300); // 60% of 500
      expect(result[1].amount_owed).toBe(200); // 40% of 500
    });

    it('validates that percentage totals sum to exactly 100%', () => {
      const isValid = validateSplitTotals({
        amount: 500,
        splitWith: ['You', 'Alice'],
        splitType: 'percentage',
        splitsData: { 'You': '60', 'Alice': '40' }
      });
      expect(isValid).toBe(true);

      const isInvalid = validateSplitTotals({
        amount: 500,
        splitWith: ['You', 'Alice'],
        splitType: 'percentage',
        splitsData: { 'You': '50', 'Alice': '40' }
      });
      expect(isInvalid).toBe(false);
    });
  });

  describe('Exact Amount Split Type', () => {
    it('allocates direct exact amounts', () => {
      const result = calculateSplit({
        amount: 450,
        splitWith: ['You', 'Alice', 'Bob'],
        splitType: 'exact',
        splitsData: { 'You': '150', 'Alice': '200', 'Bob': '100' },
        paidBy: 'You'
      });

      expect(result[0].amount_owed).toBe(150);
      expect(result[1].amount_owed).toBe(200);
      expect(result[2].amount_owed).toBe(100);
    });

    it('validates that exact amounts sum up to the total amount', () => {
      const isValid = validateSplitTotals({
        amount: 450,
        splitWith: ['You', 'Alice', 'Bob'],
        splitType: 'exact',
        splitsData: { 'You': '150', 'Alice': '200', 'Bob': '100' }
      });
      expect(isValid).toBe(true);

      const isInvalid = validateSplitTotals({
        amount: 450,
        splitWith: ['You', 'Alice', 'Bob'],
        splitType: 'exact',
        splitsData: { 'You': '150', 'Alice': '200', 'Bob': '90' }
      });
      expect(isInvalid).toBe(false);
    });
  });
});
