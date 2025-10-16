import { allertService } from './allertService'

// Inizializza il servizio di allert quando l'applicazione si avvia
export function initializeAllertService() {
  // Avvia il scheduler degli allert
  allertService.startAllertScheduler()
  
  // Gestisce la pulizia quando l'applicazione si chiude
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      allertService.stopAllertScheduler()
    })
  }
  
  console.log('Allert service initialized')
}
