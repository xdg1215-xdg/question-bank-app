<template>
  <div class="chapter-select">
    <div class="top-bar">
      <span class="back" @click="$router.back()">‹ 返回</span>
      <span class="title">{{ chapterName }}</span>
    </div>
    <div class="type-filter">
      <span v-for="t in ['全部','单选','多选','判断']" :key="t" :class="{ active: selectedType === t }" @click="selectedType = t">{{ t }}</span>
    </div>
    <div class="q-list">
      <div v-for="(q, idx) in filtered" :key="q.id" class="q-card" @click="goPractice(idx)">
        <div class="q-meta">
          <span class="q-type" :class="q.type">{{ q.type }}</span>
          <span class="q-id">#{{ q.id }}</span>
        </div>
        <div class="q-content">{{ q.content }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionStore } from '../stores/questionStore'

const route = useRoute()
const router = useRouter()
const store = useQuestionStore()
const sheetId = Number(route.params.sheetId)
const chapterName = decodeURIComponent(route.params.chapter)
const selectedType = ref('全部')

const allQs = computed(() => store.getByChapter(sheetId, chapterName))
const filtered = computed(() => store.filterByType(allQs.value, selectedType.value))

function goPractice(idx) {
  const ids = filtered.value.map(q => q.id)
  router.push({ path: `/paper/${sheetId}/practice`, query: { ids: ids.join(','), start: idx } })
}
</script>

<style scoped>
.chapter-select { padding: 12px; max-width: 480px; margin: 0 auto; }
.top-bar { display: flex; align-items: center; margin-bottom: 14px; }
.back { font-size: 16px; color: #4a90d9; cursor: pointer; margin-right: 10px; }
.title { font-size: 14px; font-weight: 600; color: #333; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.type-filter { display: flex; gap: 8px; margin-bottom: 14px; }
.type-filter span { padding: 5px 14px; border-radius: 20px; font-size: 13px; cursor: pointer; background: #eee; color: #555; }
.type-filter span.active { background: #4a90d9; color: #fff; }
.q-list { display: flex; flex-direction: column; gap: 8px; }
.q-card { background: #fff; border-radius: 10px; padding: 12px 14px; box-shadow: 0 1px 4px rgba(0,0,0,.07); cursor: pointer; }
.q-meta { display: flex; justify-content: space-between; margin-bottom: 6px; }
.q-type { font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.q-type.单选 { background: #e8f0fe; color: #1a73e8; }
.q-type.多选 { background: #fdf3e7; color: #d97706; }
.q-type.判断 { background: #e6f4ea; color: #16a34a; }
.q-id { font-size: 11px; color: #ccc; }
.q-content { font-size: 14px; color: #333; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>