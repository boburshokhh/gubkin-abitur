import { onMounted, ref } from 'vue'
import { fetchAdmissionStatus } from '@/api/cms.js'

const fallbackIsOpen = import.meta.env.VITE_ADMISSION_OPEN === 'true'
const isAdmissionOpen = ref(fallbackIsOpen)
const isAdmissionStatusLoading = ref(false)
const admissionStatusError = ref(null)
let hasLoadedAdmissionStatus = false
let loadingPromise = null

async function loadAdmissionStatus({ force = false } = {}) {
  if (loadingPromise && !force) return loadingPromise
  if (hasLoadedAdmissionStatus && !force) return isAdmissionOpen.value

  isAdmissionStatusLoading.value = true
  admissionStatusError.value = null

  loadingPromise = fetchAdmissionStatus()
    .then((data) => {
      isAdmissionOpen.value = data?.is_open === true
      hasLoadedAdmissionStatus = true
      return isAdmissionOpen.value
    })
    .catch((err) => {
      admissionStatusError.value = err
      isAdmissionOpen.value = fallbackIsOpen
      return isAdmissionOpen.value
    })
    .finally(() => {
      isAdmissionStatusLoading.value = false
      loadingPromise = null
    })

  return loadingPromise
}

export function useAdmissionStatus({ loadOnMount = true } = {}) {
  if (loadOnMount) onMounted(() => loadAdmissionStatus())

  return {
    isAdmissionOpen,
    isAdmissionStatusLoading,
    admissionStatusError,
    loadAdmissionStatus
  }
}
