import { CivilCalculatorDef, CalculatorExecutionResult, CalculatorNumericalTest } from '../types';

export const CalculatorService = {
  async getCalculators(): Promise<CivilCalculatorDef[]> {
    try {
      const res = await fetch('/api/calculators');
      const data = await res.json();
      return data.calculators || [];
    } catch (err) {
      console.error('Failed to fetch calculators:', err);
      return [];
    }
  },

  async execute(id: string, inputs: Record<string, any>): Promise<CalculatorExecutionResult | null> {
    try {
      const res = await fetch(`/api/calculators/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs }),
      });
      const data = await res.json();
      return data.result || null;
    } catch (err) {
      console.error('Failed to execute calculator:', err);
      return null;
    }
  },

  async runNumericalTests(): Promise<{
    totalTests: number;
    passedTests: number;
    failedTests: number;
    results: CalculatorNumericalTest[];
  } | null> {
    try {
      const res = await fetch('/api/calculators/run-tests');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Failed to run numerical tests:', err);
      return null;
    }
  },
};
