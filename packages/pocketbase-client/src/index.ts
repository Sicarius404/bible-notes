export { getPocketBase, resetPocketBase, escapeFilterValue } from './client'
export type { PocketBase } from './client'
export {
  signUp,
  logIn,
  logOut,
  getCurrentUser,
  isAuthenticated,
  requestPasswordReset,
  updateProfile,
} from './auth'
export type { AuthUser } from './auth'
export {
  createBibleNote,
  getBibleNote,
  updateBibleNote,
  deleteBibleNote,
  listBibleNotes,
  getAllVerseRefs,
} from './bible-notes'
export {
  createSmallGroupNote,
  getSmallGroupNote,
  updateSmallGroupNote,
  deleteSmallGroupNote,
  listSmallGroupNotes,
} from './small-groups'
export {
  createSermon,
  getSermon,
  updateSermon,
  deleteSermon,
  listSermons,
  getAllCampuses,
  getAllPastors,
} from './sermons'
export {
  createReadingPlan,
  getReadingPlan,
  updateReadingPlan,
  deleteReadingPlan,
  listReadingPlans,
  markDayComplete,
  getPlanProgress,
  getAllProgressRecords,
  getPlanCompletionPercentage,
  importReadingPlan,
} from './reading-plans'
export {
  createRevelation,
  getRevelation,
  updateRevelation,
  deleteRevelation,
  listRevelations,
} from './revelations'
export {
  exportAllData,
  importData,
} from './export-import'
export type { ExportData, ImportResult } from './export-import'