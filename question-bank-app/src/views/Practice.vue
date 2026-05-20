<template>
  <div class="practice">
    <div class="top-bar">
      <span class="back" @click="$router.back()">‹ 返回</span>
      <div class="progress">{{ currentIdx + 1 }} / {{ questions.length }}</div>
      <span class="fav" :class="{ active: isFav }" @click="toggleFav">☆</span>
    </div>
    <div class="progress-bar"><div class="bar" :style="{ width: ((currentIdx + 1) / questions.length * 100) + '%' }"></div></div>

    <div v-if="current" class="q-box">
      <span class="q-type-tag" :class="current.type">{{ current.type }}</span>
      <div class="q-text">{{ current.content }}</div>
      <div class="options">
        <div v-for="opt in current.options" :key="opt.label"
          class="opt" :class="getOptClass(opt.label)"
          @click="select(opt.label)">
          <span class="opt-label">{{ opt.label }}</span>
          <span class="opt-text">{{ opt.text }}</span>
        </div>
      </div>
    </div>

    <div v-if="answered" class="result-panel">
      <div class="result-text" :class="isCorrect ? 'ok' : 'err'">{{ isCorrect ? '✓ 正确' : '✗ 错误' }}</div>
      <div v-if="!isCorrect" class="correct-answer">正确答案：{{ current.answer }}</div>
      <div v-if="current.analysis" class="analysis">📖 {{ current.analysis }}</div>
    </div>

    <div class="nav-bar">
      <button class="nav-btn" :disabled="currentIdx === 0" @click="prev">‹ 上一题</button>
      <button v-if="!answered" class="submit-btn" :disabled="selected.length === 0" @click="submit">提交答案</button>
      <button v-else class="nav-btn" @click="next">下一题 ›</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionStore } from '../stores/questionStore'
import { useLocalStore } from '../stores/localStore'

const route = useRoute()
const router = useRouter()
const store = useQuestionStore()
const local = useLocalStore()

const sheetId = Number(route.params.sheetId)
const idsParam = route.query.ids
const startIdx = Number(route.query.start) || 0

const questionIds = idsParam ? idsParam.split(',').map(Number) : store.getBySheet(sheetId).map(q => q.id)
const questions = questionIds.map(id => store.allQuestions.find(q => q.id === id)).filter(Boolean)
const currentIdx = ref(startIdx)
const selected = ref([])
const answered = ref(false)

const current = computed(() => questions[currentIdx.value])
const isFav = computed(() => local.isFav(current.value?.id))

const isCorrect = computed(() => {
  if (!current.value) return false
  const ans = current.value.answer.toUpperCase()
  const sel = selected.value.sort().join('')
  return ans === sel
})

function getOptClass(label) {
  if (!answered.value) return selected.value.includes(label) ? 'selected' : ''
  const isAns = current.value.answer.toUpperCase().includes(label)
  const isSel = selected.value.includes(label)
  if (isAns) return 'correct'
  if (isSel) return 'wrong'
  return ''
}

function select(label) {
  if (answered.value) return
  if (current.value.type === '单选' || current.value.type === '判断') {
    selected.value = [label]
  } else {
    const i = selected.value.indexOf(label)
    if (i >= 0) selected.value.splice(i, 1)
    else selected.value.push(label)
  }
}

function submit() {
  answered.value = true
  if (!isCorrect.value) local.addWrong(current.value.id)
}

function toggleFav() {
  local.toggleFav(current.value.id)
}

function prev() {
  if (currentIdx.value > 0) { currentIdx.value--; reset() }
}
function next() {
  if (currentIdx.value < questions.length - 1) { currentIdx.value++; reset() }
}
function reset() { selected.value = []; answered.value = false }
</script>

<style scoped>
.practice { padding: 12px; max-width: 480px; margin: 0 auto; }
.top-bar { display: flex; align-items: center; margin-bottom: 10px; }
.back { font-size: 16px; color: #4a90d9; cursor: pointer; margin-right: auto; }
.progress { font-size: 14px; color: #888; }
.fav { font-size: 20px; color: #ccc; cursor: pointer; margin-left: 10px; }
.fav.active { color: #f5c518; }
.progress-bar { height: 4px; background: #eee; border-radius: 2px; margin-bottom: 16px; }
.bar { height: 100%; background: #4a90d9; border-radius: 2px; transition: width .3s; }
.q-box { background: #fff; border-radius: 12px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,.08); margin-bottom: 14px; }
.q-type-tag { font-size: 12px; padding: 3px 10px; border-radius: 4px; display: inline-block; margin-bottom: 10px; }
.q-type-tag.单选 { background: #e8f0fe; color: #1a73e8; }
.q-type-tag.多选 { background: #fdf3e7; color: #d97706; }
.q-type-tag.判断 { background: #e6f4ea; color: #16a34a; }
.q-text { font-size: 15px; color: #222; line-height: 1.6; margin-bottom: 14px; }
.options { display: flex; flex-direction: column; gap: 8px; }
.opt { display: flex; align-items: center; padding: 10px 12px; border-radius: 8px; border: 2px solid #eee; cursor: pointer; font-size: 14px; transition: all .15s; }
.opt.selected { border-color: #4a90d9; background: #e8f0fe; }
.opt.correct { border-color: #16a34a; background: #e6f4ea; }
.opt.wrong { border-color: #e53e3e; background: #fef2f2; }
.opt-label { width: 22px; height: 22px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 10px; flex-shrink: 0; }
.opt.selected .opt-label { background: #4a90d9; color: #fff; }
.opt.correct .opt-label { background: #16a34a; color: #fff; }
.opt.wrong .opt-label { background: #e53e3e; color: #fff; }
.result-panel { background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.result-text { font-size: 16px; font-weight: 600; padding: 8px 0; }
.result-text.ok { color: #16a34a; }
.result-text.err { color: #e53e3e; }
.correct-answer { color: #16a34a; font-size: 14px; margin-bottom: 8px; }
.analysis { background: #f5f5f5; border-radius: 8px; padding: 10px; font-size: 13px; color: #555; line-height: 1.5; }
.nav-bar { display: flex; gap: 10px; }
.nav-btn { flex: 1; padding: 12px; border-radius: 10px; border: none; background: #eee; font-size: 14px; cursor: pointer; }
.nav-btn:disabled { opacity: .4; }
.submit-btn { flex: 1; padding: 12px; border-radius: 10px; border: none; background: #4a90d9; color: #fff; font-size: 14px; cursor: pointer; }
.submit-btn:disabled { opacity: .4; }
</style>