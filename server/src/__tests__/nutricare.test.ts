import { describe, it, expect } from 'vitest';
import { calculateBMI, calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacroSplit, estimateActivityCalories, calculateAge } from '../utils/calculations.js';

describe('NutriCare Core Calculations & Logic Suite', () => {

  describe('BMI Calculation', () => {
    it('should calculate BMI accurately for normal weight', () => {
      // 70 kg, 175 cm => 70 / (1.75^2) = 22.86 => 22.9
      const result = calculateBMI(70, 175);
      expect(result.bmi).toBe(22.9);
      expect(result.category).toBe('Normal');
      expect(result.healthyWeightRangeKg.min).toBe(56.7);
      expect(result.healthyWeightRangeKg.max).toBe(76.3);
      expect(result.disclaimer).toContain('screening indicator');
    });

    it('should classify overweight and underweight correctly', () => {
      const overweight = calculateBMI(85, 170);
      expect(overweight.category).toBe('Overweight');

      const underweight = calculateBMI(45, 165);
      expect(underweight.category).toBe('Underweight');

      const obese = calculateBMI(110, 170);
      expect(obese.category).toBe('Obese');
    });

    it('should handle zero or negative input gracefully', () => {
      const invalid = calculateBMI(0, 0);
      expect(invalid.bmi).toBe(0);
      expect(invalid.disclaimer).toContain('positive numbers');
    });
  });

  describe('Age & BMR Calculations', () => {
    it('should calculate age accurately from birth date', () => {
      const dob = '1995-05-15';
      const age = calculateAge(dob);
      expect(age).toBeGreaterThan(25);
    });

    it('should calculate BMR for male using Mifflin-St Jeor', () => {
      // 75 kg, 175 cm, 30 years old, male:
      // 10*75 + 6.25*175 - 5*30 + 5 = 750 + 1093.75 - 150 + 5 = 1698.75 => 1699
      const bmrMale = calculateBMR(75, 175, 30, 'male');
      expect(bmrMale).toBe(1699);
    });

    it('should calculate BMR for female using Mifflin-St Jeor', () => {
      // 60 kg, 160 cm, 28 years old, female:
      // 10*60 + 6.25*160 - 5*28 - 161 = 600 + 1000 - 140 - 161 = 1299
      const bmrFemale = calculateBMR(60, 160, 28, 'female');
      expect(bmrFemale).toBe(1299);
    });
  });

  describe('TDEE & Caloric Goal Targets', () => {
    it('should calculate TDEE based on activity levels', () => {
      const bmr = 1600;
      expect(calculateTDEE(bmr, 'sedentary')).toBe(1920);
      expect(calculateTDEE(bmr, 'moderately_active')).toBe(2480);
      expect(calculateTDEE(bmr, 'very_active')).toBe(2760);
    });

    it('should enforce safe caloric floors on weight loss targets', () => {
      const tdee = 1400; // Even with deficit, it should not drop below safe floor of 1300
      const target = calculateTargetCalories(tdee, 'weight_loss');
      expect(target).toBeGreaterThanOrEqual(1300);
    });

    it('should calculate macronutrient ratios appropriately', () => {
      const targetCalories = 2000;
      const weightLossMacros = calculateMacroSplit(targetCalories, 'weight_loss');

      // 30% protein => 600 kcal / 4 = 150g
      expect(weightLossMacros.proteinGrams).toBe(150);
      // 40% carbs => 800 kcal / 4 = 200g
      expect(weightLossMacros.carbohydrateGrams).toBe(200);
      // 30% fat => 600 kcal / 9 = 67g
      expect(weightLossMacros.fatGrams).toBe(67);
    });
  });

  describe('MET Physical Activity Calorie Estimation', () => {
    it('should calculate estimated calories burned based on duration and weight', () => {
      // Running for 60 mins (MET 8.5) at 70kg: 8.5 * 70 * 1 = 595 kcal
      const runningCalories = estimateActivityCalories('running', 60, 70);
      expect(runningCalories).toBe(595);

      // Walking for 30 mins (MET 3.5) at 70kg: 3.5 * 70 * 0.5 = 122.5 => 123 kcal
      const walkingCalories = estimateActivityCalories('walking', 30, 70);
      expect(walkingCalories).toBe(123);
    });
  });

});
