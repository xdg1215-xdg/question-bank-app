<template>
  <div class="exam">
    <div class="top-bar">
      <span class="back" @click="backIfDone">‹ 返回</span>
      <div class="timer" v-if="started && !finished">⏱ {{ mins }}:{{ secs02 }}</div>
      <span class="score" v-if="finished">得分 {{ score }}/{{ total }}</span>
    </div>

    <div v-if="!started" class="start-panel">
      <div class="info">模拟考试 · {{ sheetName }}</div>
      <div class="config">
        <div class="config-row">
          <span>题目数量</span>
          <select v-model="config.count">
            <option v-for="n in [10,20,30,50]" :key="n" :value="n">{{ n }}题</option>
          </select>
        </div>
        <div class="config-row">
          <span>计时</span>
          <label class="switch"><input type="checkbox" v-model="config.timed"><span></span></label>
        </div>
        <div v-if="config.timed" class="config-row">
          <span>时限（分钟）</span>
          <select v-model="config.minutes">
            <option v-for="n in [5,10,15,20,30]" :key="n" :value="n">{{ n }}分钟</option>
          </select>
        </div>
        <div class="type-ratio">
          <span>出题比例：单选{{ Math.round(config.count * 0.5) }} / 多选{{ Math.round(config.count * 0.3) }} / 判断{{ Math.round(config.count * 0.2) }}</span>
        </div>
      </div>
      <button class="start-btn" @click="startExam">开始考试</button>
    </div>

    <div v-else-if="!finished" class="q-box">
      <div class="q-num">第 {{ currentIdx + 1 }} 题 / 共 {{ total }} 题</div>
      <div class="progress-bar"><div class="bar" :style="{ width: ((currentIdx + 1) / total * 100) + '%' }"></div></div>
      <span class="q-type-tag" :class="current.type">{{ current.type }}</span>
      <div class="q-text">{{ current.content }}</div>
      <div class="options">
        <div v-for="opt in current.options" :key="opt.label"
          class="opt" :class="isSelected(opt.label) ? 'selected' : ''"
          @click="select(opt.label)">
          <span class="opt-label">{{ opt.label }}</span>
          <span class="opt-text">{{ opt.text }}</span>
        </div>
      </div>
    </div>

    <div v-if="!finished" class="nav-bar">
      <button class="nav-btn" :disabled="currentIdx === 0" @click="currentIdx--">‹ 上一题</button>
      <button class="submit-btn" @click="submitAnswer">{{ currentIdx === total - 1 ? '交卷' : '下一题 ›' }}</button>
    </div>

    <div v-if="finished" class="result-panel">
      <div class="score-circle" :class="score >= total * 0.6 ? 'pass' : 'fail'">
        <div class="score-num">{{ score }}</div>
        <div class="score-total">/{{ total }}</div>
      </div>
      <div class="score-tip">{{ score >= total * 0.6 ? '🎉 及格，继续保持！' : '📚 建议复习错题后再考' }}</div>
      <div class="wrong-list">
        <div class="wrong-title">错题回顾 ({{ wrongIds.length }}题)</div>
        <div v-for="q in wrongQuestions" :key="q.id" class="wrong-item" @click="reviewWrong(q)">
          <span class="q-type-tag" :class="q.type">{{ q.type }}</span>
          <span class="q-content">{{ q.content }}</span>
          <span class="correct-ans">答案: {{ q.answer }}</span>
        </div>
      </div>
      <div class="action-btns">
        <button class="retry-btn" @click="reset">重新考试</button>
        <button class="review-btn" @click="reviewWrongAll">复习错题</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionStore } from '../stores/questionStore'
import { useLocalStore } from '../stores/localStore'

const route = useRoute()
const router = useRouter()
const store = useQuestionStore()
const local = useLocalStore()

const sheetId = Number(route.params.sheetId)
const sheetName = store.sheets.find(s => s.id === sheetId)?.name || ''

const config = ref({ count: 20, timed: true, minutes: 10 })
const started = ref(false)
const finished = ref(false)
const questions = ref([])
const currentIdx = ref(0)
const answers = ref({})
const selected = ref([])
const score = ref(0)
const wrongIds = ref([])
const total = computed(() => questions.value.length)
let timer = null
let remaining = 0

const current = computed(() => questions.value[currentIdx.value])

function secs02() { return String(remaining % 60).padStart(2, '0') }
const mins = computed(() => Math.floor(remaining / 60))

function startExam() {
  const all = store.getBySheet(sheetId)
  const 单选 = all.filter(q => q.type === '单选')
  const 多选 = all.filter(q => q.type === '多选')
  const 判断 = all.filter(q => q.type === '判断')
  const n = config.value.count
  const ns = Math.round(n * 0.5)
  const nm = Math.round(n * 0.3)
  const nj = n - ns - nm

  function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }
  questions.value = [
    ...shuffle(单选).slice(0, ns),
    ...shuffle(多选).slice(0, nm),
    ...shuffle(判断).slice(0, nj),
  ].sort(() => Math.random() - 0.5)

  started.value = true
  if (config.value.timed) {
    remaining = config.value.minutes * 60
    timer = setInterval(() => {
      remaining--
      if (remaining <= 0) { clearInterval(timer); submitExam() }
    }, 1000)
  }
}

function isSelected(label) { return selected.value.includes(label) }

function select(label) {
  if (current.value.type === '单选' || current.value.type === '判断') selected.value = [label]
  else {
    const i = selected.value.indexOf(label)
    if (i >= 0) selected.value.splice(i, 1)
    else selected.value.push(label)
  }
}

function submitAnswer() {
  answers.value[currentIdx.value] = [...selected.value]
  selected.value = []
  if (currentIdx.value < total.value - 1) currentIdx.value++
  else submitExam()
}

function submitExam() {
  if (timer) { clearInterval(timer); timer = null }
  let s = 0
  const wids = []
  questions.value.forEach((q, i) => {
    const ans = q.answer.toUpperCase()
    const sel = (answers.value[i] || []).sort().join('')
    if (ans === sel) s++
    else { wids.push(q.id); local.addWrong(q.id) }
  })
  score.value = s
  wrongIds.value = wids
  finished.value = true
}

function backIfDone() {
  if (finished.value) { reset(); router.back() }
  else if (started.value) { if (confirm('放弃本次考试？')) { clearInterval(timer); router.back() } }
  else router.back()
}

const wrongQuestions = computed(() => wrongIds.value.map(id => store.allQuestions.find(q => q.id === id)).filter(Boolean))

function reviewWrong(q) {
  const ids = [q.id]
  router.push({ path: `/paper/${sheetId}/practice`, query: { ids: ids.join(','), start: 0 } })
}

function reviewWrongAll() {
  if (wrongIds.value.length === 0) return
  router.push({ path: `/paper/${sheetId}/practice`, query: { ids: wrongIds.value.join(','), start: 0 } })
}

function reset() {
  started.value = false; finished.value = false
  questions.value = []; currentIdx.value = 0
  answers.value = {}; selected.value = []
  score.value = 0; wrongIds.value = []
  if (timer) { clearInterval(timer); timer = null }
}

onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.exam { padding: 12px; max-width: 480px; margin: 0 auto; }
.top-bar { display: flex; align-items: center; margin-bottom: 12px; }
.back { font-size: 16px; color: #4a90d9; cursor: pointer; }
.timer { flex: 1; text-align: center; font-size: 16px; color: #e67e22; font-weight: 600; }
.score { flex: 1; text-align: center; font-size: 16px; color: #4a90d9; font-weight: 600; }
.start-panel { text-align: center; }
.info { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 20px; }
.config { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; text-align: left; }
.config-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
.config-row:last-child { border: none; }
select { padding: 4px 8px; font-size: 14px; }
.switch { position: relative; display: inline-block; width: 40px; height: 22px; }
.switch input { opacity: 0; width: 0; height: 0; }
.switch span { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #ccc; border-radius: 22px; transition: .3s; }
.switch span:before { position: absolute; content: ''; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: .3s; }
.switch input:checked + span { background: #4a90d9; }
.switch input:checked + span:before { transform: translateX(18px); }
.type-ratio { font-size: 12px; color: #888; margin-top: 10px; text-align: center; }
.start-btn { width: 100%; padding: 14px; border-radius: 12px; border: none; background: #4a90d9; color: #fff; font-size: 16px; cursor: pointer; }
.q-num { font-size: 13px; color: #888; margin-bottom: 6px; }
.progress-bar { height: 3px; background: #eee; border-radius: 2px; margin-bottom: 14px; }
.bar { height: 100%; background: #4a90d9; border-radius: 2px; transition: width .3s; }
.q-box { background: #fff; border-radius: 12px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,.08); margin-bottom: 14px; }
.q-type-tag { font-size: 12px; padding: 3px 10px; border-radius: 4px; display: inline-block; margin-bottom: 10px; }
.q-type-tag.单选 { background: #e8f0fe; color: #1a73e8; }
.q-type-tag.多选 { background: #fdf3e7; color: #d97706; }
.q-type-tag.判断 { background: #e6f4ea; color: #16a34a; }
.q-text { font-size: 15px; color: #222; line-height: 1.6; margin-bottom: 14px; }
.options { display: flex; flex-direction: column; gap: 8px; }
.opt { display: flex; align-items: center; padding: 10px 12px; border-radius: 8px; border: 2px solid #eee; cursor: pointer; font-size: 14px; }
.opt.selected { border-color: #4a90d9; background: #e8f0fe; }
.opt-label { width: 22px; height: 22px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 10px; flex-shrink: 0; }
.opt.selected .opt-label { background: #4a90d9; color: #fff; }
.nav-bar { display: flex; gap: 10px; }
.nav-btn { flex: 1; padding: 12px; border-radius: 10px; border: none; background: #eee; font-size: 14px; cursor: pointer; }
.nav-btn:disabled { opacity: .4; }
.submit-btn { flex: 1; padding: 12px; border-radius: 10px; border: none; background: #4a90d9; color: #fff; font-size: 14px; cursor: pointer; }
.result-panel { text-align: center; }
.score-circle { width: 120px; height: 120px; border-radius: 50%; margin: 20px auto; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.score-circle.pass { background: #e6f4ea; }
.score-circle.fail { background: #fef2f2; }
.score-num { font-size: 36px; font-weight: 700; }
.score-total { font-size: 16px; color: #888; }
.score-tip { font-size: 15px; color: #333; margin: 10px 0 20px; }
.wrong-list { background: #fff; border-radius: 12px; padding: 14px; text-align: left; margin-bottom: 16px; }
.wrong-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 10px; }
.wrong-item { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 8px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer; font-size: 13px; }
.wrong-item:last-child { border: none; }
.wrong-item .q-content { flex: 1; color: #555; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.correct-ans { color: #16a34a; font-size: 12px; }
.action-btns { display: flex; gap: 10px; }
.retry-btn, .review-btn { flex: 1; padding: 12px; border-radius: 10px; border: none; font-size: 14px; cursor: pointer; }
.retry-btn { background: #eee; color: #333; }
.review-btn { background: #4a90d9; color: #fff; }
</style>