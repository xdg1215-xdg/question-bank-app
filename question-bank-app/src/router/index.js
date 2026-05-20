import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import PaperSelect from '../views/PaperSelect.vue'
import ChapterSelect from '../views/ChapterSelect.vue'
import Practice from '../views/Practice.vue'
import Exam from '../views/Exam.vue'
import WrongNotes from '../views/WrongNotes.vue'
import Favorites from '../views/Favorites.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/paper/:sheetId', component: PaperSelect },
  { path: '/paper/:sheetId/chapter/:chapter', component: ChapterSelect },
  { path: '/paper/:sheetId/practice', component: Practice },
  { path: '/paper/:sheetId/exam', component: Exam },
  { path: '/wrong', component: WrongNotes },
  { path: '/favorites', component: Favorites },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})