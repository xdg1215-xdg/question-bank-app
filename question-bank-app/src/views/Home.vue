<template>
  <div class="home">
    <div class="header">
      <h1>📖 题库练习</h1>
      <p class="subtitle">中盐常化2026年管理人员制度学习</p>
    </div>
    <div class="stats-bar">
      <span>单选 {{ stats.单选 }}</span>
      <span>多选 {{ stats.多选 }}</span>
      <span>判断 {{ stats.判断 }}</span>
      <span>共 {{ stats.单选 + stats.多选 + stats.判断 }} 题</span>
    </div>
    <div class="paper-list">
      <div v-for="sheet in store.sheets" :key="sheet.id" class="paper-card" @click="$router.push(`/paper/${sheet.id}`)">
        <div class="paper-icon">🏢</div>
        <div class="paper-info">
          <div class="paper-name">{{ sheet.name }}</div>
          <div class="paper-count">共 {{ sheet.count }} 题</div>
        </div>
        <div class="arrow">›</div>
      </div>
    </div>
    <div class="quick-actions">
      <div class="action-btn" @click="$router.push('/wrong')">📝 错题本 <span v-if="wrongCount>0" class="badge">{{ wrongCount }}</span></div>
      <div class="action-btn" @click="$router.push('/favorites')">⭐ 收藏夹</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuestionStore } from '../stores/questionStore'
import { useLocalStore } from '../stores/localStore'

const store = useQuestionStore()
const local = useLocalStore()

const stats = computed(() => {
  let 单选=0, 多选=0, 判断=0
  store.allQuestions.forEach(q => {
    if (q.type==='单选') 单选++
    else if (q.type==='多选') 多选++
    else if (q.type==='判断') 判断++
  })
  return { 单选, 多选, 判断 }
})

const wrongCount = computed(() => local.getWrong().length)
</script>

<style scoped>
.home { padding: 16px; max-width: 480px; margin: 0 auto; }
.header { text-align: center; margin: 20px 0; }
.header h1 { font-size: 24px; margin: 0 0 6px; }
.subtitle { color: #666; font-size: 14px; margin: 0; }
.stats-bar { display: flex; justify-content: center; gap: 12px; background: #f0f4ff; border-radius: 10px; padding: 10px; margin-bottom: 18px; font-size: 13px; }
.stats-bar span { color: #444; }
.paper-list { display: flex; flex-direction: column; gap: 12px; }
.paper-card { display: flex; align-items: center; background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.08); cursor: pointer; transition: transform .15s; }
.paper-card:hover { transform: scale(1.02); }
.paper-card:active { transform: scale(.98); }
.paper-icon { font-size: 32px; margin-right: 14px; }
.paper-info { flex: 1; }
.paper-name { font-size: 15px; font-weight: 600; color: #222; }
.paper-count { font-size: 13px; color: #888; margin-top: 4px; }
.arrow { font-size: 22px; color: #ccc; }
.quick-actions { display: flex; gap: 12px; margin-top: 18px; }
.action-btn { flex: 1; background: #fff; border-radius: 12px; padding: 14px; text-align: center; font-size: 14px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.08); position: relative; }
.badge { background: #e74c3c; color: #fff; border-radius: 10px; padding: 2px 7px; font-size: 12px; margin-left: 4px; }
</style>