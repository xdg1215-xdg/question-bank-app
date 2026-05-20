import { defineStore } from 'pinia'
import questionBank from '../question_bank.json'

export const useQuestionStore = defineStore('questions', () => {
  const sheets = [
    { id: 1, name: '职能部室中层干部（含助理）', count: 736 },
    { id: 2, name: '制造系统中层（含助理）', count: 975 },
  ]

  function getBySheet(sheetId) {
    return questionBank.filter(q => q.sheet.includes(sheetId === 1 ? '职能' : '制造'))
  }

  function getByChapter(sheetId, chapter) {
    return getBySheet(sheetId).filter(q => q.chapter === chapter)
  }

  function getChapters(sheetId) {
    const qs = getBySheet(sheetId)
    const map = {}
    qs.forEach(q => {
      if (!map[q.chapter]) map[q.chapter] = { name: q.chapter, total: 0, types: {} }
      map[q.chapter].total++
      map[q.chapter].types[q.type] = (map[q.chapter].types[q.type] || 0) + 1
    })
    return Object.values(map)
  }

  function getTypeCounts(sheetId) {
    const qs = getBySheet(sheetId)
    return { 单选: qs.filter(q => q.type === '单选').length,
             多选: qs.filter(q => q.type === '多选').length,
             判断: qs.filter(q => q.type === '判断').length }
  }

  function filterByType(qs, type) {
    return type === '全部' ? qs : qs.filter(q => q.type === type)
  }

  return { sheets, getBySheet, getByChapter, getChapters, getTypeCounts, filterByType, allQuestions: questionBank }
})