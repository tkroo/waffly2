export const myBools = $state({
  debug: false,
  highContrast: false,
  fetchDefinitions: false,
  working: false,
  generateError: false
})

export const COLLECTION_NAME = 'wafflygames'

export const myArrays = $state({
  completedWords: [] as string[],
})
