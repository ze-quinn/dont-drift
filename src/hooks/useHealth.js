/**
 * Health data layer — currently manual entry via localStorage.
 * Architected for HealthKit bridge: swap updateHealthData implementation
 * to pull from a native iOS Shortcuts webhook or HealthKit API without
 * changing any consumer of this hook.
 */
import { useStore } from '../store/useStore'

export function useHealth() {
  const { healthData, updateHealthData, settings } = useStore()

  function syncManual({ steps, activeCalories, sleepHours, restingHR }) {
    updateHealthData({ steps, activeCalories, sleepHours, restingHR })
  }

  // Future: replace with HealthKit bridge
  async function syncFromHealthKit() {
    // Placeholder — will be wired to iOS Shortcuts webhook
    // Expected payload: { steps, activeCalories, sleepHours, restingHR }
    console.warn('HealthKit sync not yet implemented — use manual entry')
  }

  const bmi = settings.height && settings.weight
    ? (parseFloat(settings.weight) / Math.pow(parseFloat(settings.height) / 100, 2)).toFixed(1)
    : null

  const bmr = settings.weight && settings.height && settings.age
    ? Math.round(
        10 * parseFloat(settings.weight) +
        6.25 * parseFloat(settings.height) -
        5 * parseFloat(settings.age) - 161 // Mifflin-St Jeor for female
      )
    : null

  const distanceToTarget = settings.weight && settings.targetWeight
    ? (parseFloat(settings.weight) - parseFloat(settings.targetWeight)).toFixed(1)
    : null

  return {
    healthData,
    syncManual,
    syncFromHealthKit,
    bmi,
    bmr,
    distanceToTarget,
  }
}
