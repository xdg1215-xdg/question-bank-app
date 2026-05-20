<template>
  <div class="paper-select">
    <div class="top-bar">
      <span class="back" @click="$router.back()">‹ 返回</span>
      <span class="title">{{ sheetName }}</span>
    </div>
    <div class="type-filter">
      <span v-for="t in types" :key="t" :class="{ active: selectedType === t }" @click="selectedType = t">{{ t }}</span>
    </div>
    <div class="chapter-list">
      <div v-for="ch in chapters" :key="ch.name" class="chapter-card" @click="$router.push(`/paper/${sheetId}/chapter/${encodeURIComponent(ch.name)}`)">
        <div class="ch-name">{{ ch.name }}</div>
        <div class="ch-stats">
          <span v-if="ch.types['单选']">单选 {{ ch.types['单选'] }}</span>
          <span v-if="ch.types['多选']">多选 {{ ch.types['多选'] }}</span>
          <span v-if="ch.types['判断']">判断 {{ ch.types['判断'] }}</span>
        </div>
        <div class="arrow">›</div>
      </div>
    </div>
    <div class="mode-bar">
      <div class="mode-btn" @click="$router.push(`/paper/${sheetId}/practice`)">✍️ 按章节练习</div>
      <div class="mode-btn exam" @click="$router.push(`/paper/${sheetId}/exam`)">📋 模拟考试</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuestionStore } from '../stores/questionStore'

const route = useRoute()
const store = useQuestionStore()
const sheetId = Number(route.params.sheetId)
const sheetName = store.sheets.find(s => s.id === sheetId)?.name || ''
const types = ['全部', '单选', '多选', '判断']
const selectedType = ref('全部')
const chapters = computed(() => {
  const all = store.getChapters(sheetId)
  if (selectedType.value === '全部') return all
  return all.filter(ch => ch.types[selectedType.value])
})
</script>

<style scoped>
.paper-select { padding: 12px; max-width: 480px; margin: 0 auto; }
.top-bar { display: flex; align-items: center; margin-bottom: 14px; }
.back { font-size: 16px; color: #4a90d9; cursor: pointer; margin-right: 10px; }
.title { font-size: 15px; font-weight: 600; color: #333; }
.type-filter { display: flex; gap: 8px; margin-bottom: 14px; }
.type-filter span { padding: 5px 14px; border-radius: 20px; font-size: 13px; cursor: pointer; background: #eee; color: #555; }
.type-filter span.active { background: #4a90d9; color: #fff; }
.chapter-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.chapter-card { display: flex; align-items: center; background: #fff; border-radius: 10px; padding: 12px 14px; box-shadow: 0 1px 4px rgba(0,0,0,.07); cursor: pointer; }
.ch-name { flex: 1; font-size: 14px; color: #333; }
.ch-stats { display: flex; gap: 6px; margin-right: 8px; }
.ch-stats span { font-size: 11px; color: #888; background: #f5f5f5; padding: 2px 6px; border-radius: 4px; }
.arrow { font-size: 20px; color: #ccc; }
.mode-bar { display: flex; gap: 10px; }
.mode-btn { flex: 1; background: #4a90d9; color: #fff; text-align: center; padding: 14px; border-radius: 10px; font-size: 14px; cursor: pointer; }
.mode-btn.exam { background: #e67e22; }
</style>