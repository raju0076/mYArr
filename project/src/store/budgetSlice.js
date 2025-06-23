// store/budgetSlice.js
import { createSlice } from '@reduxjs/toolkit';

const loadBudgetFromLocalStorage = () => {
  try {
    const data = localStorage.getItem('budget');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading budget from localStorage:', error);
    return null;
  }
};

const saveBudgetToLocalStorage = (state) => {
  try {
    localStorage.setItem('budget', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving budget to localStorage:', error);
  }
};

const defaultState = {
  totalBudget:5000,
  budgetCategories: {
     food: { allocated: 3000, spent: 500 },
    transport: { allocated: 1500, spent: 200 },
    entertainment: { allocated: 1000, spent: 100 },
    accommodation: { allocated: 2500, spent: 1000 },
    activities: { allocated: 1000, spent: 300 },
    other: { allocated: 1000, spent: 0 },
  },
  alerts: [],
  isLoading: false,
  error: null,
};

const initialState = loadBudgetFromLocalStorage() || defaultState;

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudgetData: (state, action) => {
      const newState = { ...state, ...action.payload };
      saveBudgetToLocalStorage(newState);
      return newState;
    },
    setBudget: (state, action) => {
      state.totalBudget = action.payload;
      saveBudgetToLocalStorage(state);
    },
    setCategoryBudget: (state, action) => {
      const { category, amount } = action.payload;
      if (state.budgetCategories[category]) {
        state.budgetCategories[category].allocated = amount;
      } else {
        state.budgetCategories[category] = { allocated: amount, spent: 0 };
      }
      saveBudgetToLocalStorage(state);
    },
    updateSpentAmount: (state, action) => {
      const { category, amount } = action.payload;
      if (state.budgetCategories[category]) {
        state.budgetCategories[category].spent += amount;

        const categoryData = state.budgetCategories[category];
        const percentage = (categoryData.spent / categoryData.allocated) * 100;

        if (percentage >= 90) {
          state.alerts.push({
            id: Date.now(),
            type: 'danger',
            message: `You've spent ${percentage.toFixed(0)}% of your ${category} budget!`,
            timestamp: new Date().toISOString(),
          });
        } else if (percentage >= 75) {
          state.alerts.push({
            id: Date.now(),
            type: 'warning',
            message: `You've spent ${percentage.toFixed(0)}% of your ${category} budget.`,
            timestamp: new Date().toISOString(),
          });
        }

        saveBudgetToLocalStorage(state);
      }
    },
    dismissAlert: (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
      saveBudgetToLocalStorage(state);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setBudgetData,
  setBudget,
  setCategoryBudget,
  updateSpentAmount,
  dismissAlert,
  setLoading,
  setError,
} = budgetSlice.actions;

export default budgetSlice.reducer;
