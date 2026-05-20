<template>
  <div class="fav-page">
    <div class="top-bar">
      <span class="back" @click="$router.back()">‹ 返回</span>
      <span class="title">⭐ 收藏夹</span>
    </div>
    <div v-if="favIds.length === 0" class="empty">
      <div class="empty-icon">🌟</div>
      <div class="empty-text">暂无收藏</div>
      <div class="empty-sub">练习时点击 ☆ 收藏重点题</div>
    </div>
    <div v-else>
      <div class="count-tip">共 {{ favIds.length }} 道收藏</div>
      <div class="q-list">
        <div v-for="q in questions" :key="q.id" class="q-card" @click="review(q)">
          <div class="q-meta">
            <span class="q-type" :class="q.type">{{ q.type }}</span>
            <span class="remove" @click.stop="remove(q.id)">取消收藏</span>
          </div>
          <div class="q-content">{{ q.content }}</div>
        </div>
      </div>
      <button class="review-all-btn" @click="reviewAll">练习全部收藏</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '../stores/questionStore'
import { useLocalStore } from '../stores/localStore'

const router = useRouter()
const store = useQuestionStore()
const local = useLocalStore()

const favIds = computed(() => local.getFavorites())
const questions = computed(() => favIds.value.map(id => store.allQuestions.find(q => q.id === id)).filter(Boolean))

function review(q) {
  router.push({ path: `/paper/1/practice`, query: { ids: q.id.toString(), start: '0' } })
}
function reviewAll() {
  if (favIds.value.length === 0) return
  router.push({ path: `/paper/1/practice`, query: { ids: favIds.value.join(','), start: '0' } })
}
function remove(id) { local.toggleFav(id) }
</script>

<style scoped>
.fav-page { padding: 12px; max-width: 480px; margin: 0 auto; }
.top-bar { display: flex; align-items: center; margin-bottom: 14px; }
.back { font-size: 16px; color: #4a90d9; cursor: pointer; }
.title { flex: 1; text-align: center; font-size: 15px; font-weight: 600; }
.empty { text-align: center; padding: 60px 0; }
.empty-icon { font-size: 48px; }
.empty-text { font-size: 18px; color: #333; margin-top: 10px; }
.empty-sub { font-size: 14px; color: #aaa; margin-top: 6px; }
.count-tip { font-size: 14px; color: #888; margin-bottom: 12px; }
.q-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.q-card { background: #fff; border-radius: 10px; padding: 12px 14px; box-shadow: 0 1px 4px rgba(0,0,0,.07); cursor: pointer; }
.q-meta { display: flex; justify-content: space-between; margin-bottom: 6px; }
.q-type { font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.q-type.单选 { background: #e8f0fe; color: #1a73e8; }
.q-type.多选 { background: #fdf3e7; color: #d97706; }
.q-type.判断 { background: #e6f4ea; color: #16a34a; }
.remove { font-size: 12px; color: #e53e3e; cursor: pointer; }
.q-content { font-size: 14px; color: #333; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.review-all-btn { width: 100%; padding: 14px; border-radius: 10px; border: none; background: #4a90d9; color: #fff; font-size: 15px; cursor: pointer; }
</style>