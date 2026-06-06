import { onMounted, ref } from 'vue'
import { fetchRegistrationStatus } from '@/api/cms.js'

const fallbackIsOpen = import.meta.env.VITE_REGISTRATION_OPEN
  ? import.meta.env.VITE_REGISTRATION_OPEN === 'true'
  : import.meta.env.VITE_ADMISSION_OPEN === 'true'

const isRegistrationOpen = ref(fallbackIsOpen)
const isRegistrationStatusLoading = ref(false)
const registrationStatusError = ref(null)
let hasLoadedRegistrationStatus = false
let loadingPromise = null

async function loadRegistrationStatus({ force = false } = {}) {
  if (loadingPromise && !force) return loadingPromise
  if (hasLoadedRegistrationStatus && !force) return isRegistrationOpen.value

  isRegistrationStatusLoading.value = true
  registrationStatusError.value = null

  loadingPromise = fetchRegistrationStatus()
    .then((data) => {
      isRegistrationOpen.value = data?.is_open === true
      hasLoadedRegistrationStatus = true
      return isRegistrationOpen.value
    })
    .catch((err) => {
      registrationStatusError.value = err
      isRegistrationOpen.value = fallbackIsOpen
      return isRegistrationOpen.value
    })
    .finally(() => {
      isRegistrationStatusLoading.value = false
      loadingPromise = null
    })

  return loadingPromise
}

export function useRegistrationStatus({ loadOnMount = true } = {}) {
  if (loadOnMount) onMounted(() => loadRegistrationStatus())

  return {
    isRegistrationOpen,
    isRegistrationStatusLoading,
    registrationStatusError,
    loadRegistrationStatus
  }
}
