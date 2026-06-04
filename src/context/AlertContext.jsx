import { createContext, useContext } from 'react'

export const AlertContext = createContext({ showAlert: () => {} })

export function useAlertTrigger() {
  return useContext(AlertContext)
}
