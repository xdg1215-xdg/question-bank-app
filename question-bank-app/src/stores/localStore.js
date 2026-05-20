import { defineStore } from 'pinia'

function loadArray(key, fallback = []) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function saveArray(key, arr) { localStorage.setItem(key, JSON.stringify(arr)) }

export const useLocalStore = defineStore('local', () => {
  const wrongKey = 'qb_wrong'
  const favKey = 'qb_fav'

  function getWrong() { return loadArray(wrongKey) }
  function addWrong(qid) {
    const w = getWrong()
    if (!w.includes(qid)) { w.push(qid); saveArray(wrongKey, w) }
  }
  function removeWrong(qid) {
    const w = getWrong().filter(id => id !== qid); saveArray(wrongKey, w)
  }
  function clearWrong() { saveArray(wrongKey, []) }

  function getFavorites() { return loadArray(favKey) }
  function toggleFav(qid) {
    const f = getFavorites()
    if (f.includes(qid)) saveArray(favKey, f.filter(id => id !== qid))
    else { f.push(qid); saveArray(favKey, f) }
  }
  function isFav(qid) { return getFavorites().includes(qid) }

  return { getWrong, addWrong, removeWrong, clearWrong, getFavorites, toggleFav, isFav }
})