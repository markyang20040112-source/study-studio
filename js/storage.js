/**
 * 學習進度持久化模組 (LocalStorage Storage Manager)
 * 命名空間：BA_STUDY_PROGRESS_V1
 */

const STORAGE_KEY = "BA_STUDY_PROGRESS_V1";

const DEFAULT_STORAGE = {
  lastActiveUnit: "ch02-descriptive",
  lastActiveLevel: 0,
  questionState: {}
};

class StudyStorage {
  static getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STORAGE));
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STORAGE, ...parsed };
    } catch (e) {
      console.error("Failed to read localStorage:", e);
      return JSON.parse(JSON.stringify(DEFAULT_STORAGE));
    }
  }

  static saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent("study-storage-updated", { detail: data }));
    } catch (e) {
      console.error("Failed to write to localStorage:", e);
    }
  }

  static getQuestionState(questionId) {
    const data = this.getData();
    return data.questionState[questionId] || {
      status: "unattempted", // "unattempted" | "review_needed" | "mastered"
      userAttempts: 0,
      lastSelected: null,
      isBookmarked: false,
      hintViewed: false,
      timestamp: null
    };
  }

  static updateQuestionState(questionId, patch) {
    const data = this.getData();
    const current = data.questionState[questionId] || {
      status: "unattempted",
      userAttempts: 0,
      lastSelected: null,
      isBookmarked: false,
      hintViewed: false,
      timestamp: Date.now()
    };

    data.questionState[questionId] = {
      ...current,
      ...patch,
      timestamp: Date.now()
    };

    this.saveData(data);
    return data.questionState[questionId];
  }

  static toggleBookmark(questionId) {
    const current = this.getQuestionState(questionId);
    return this.updateQuestionState(questionId, {
      isBookmarked: !current.isBookmarked
    });
  }

  static setLastActive(unitId, level) {
    const data = this.getData();
    if (unitId) data.lastActiveUnit = unitId;
    if (level !== undefined && level !== null) data.lastActiveLevel = level;
    this.saveData(data);
  }

  static exportBackup() {
    const data = this.getData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BA_STUDY_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== "object" || !parsed.questionState) {
        throw new Error("無效的備份檔案格式");
      }
      this.saveData(parsed);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  static resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    const blank = JSON.parse(JSON.stringify(DEFAULT_STORAGE));
    this.saveData(blank);
    return blank;
  }

  static calculateStats(allQuestions) {
    const data = this.getData();
    const states = data.questionState || {};

    let total = allQuestions.length;
    let mastered = 0;
    let reviewNeeded = 0;
    let unattempted = 0;
    let bookmarkedCount = 0;

    // Unit breakdown
    const unitStats = {};
    for (let u of UNITS) {
      unitStats[u.id] = { total: 0, mastered: 0, reviewNeeded: 0, unattempted: 0 };
    }

    // Type breakdown (mcq vs numeric/self-check)
    const typeStats = {
      concept: { total: 0, mastered: 0 },
      calc: { total: 0, mastered: 0 }
    };

    for (let q of allQuestions) {
      const state = states[q.id] || { status: "unattempted" };
      const st = state.status || "unattempted";

      if (state.isBookmarked) bookmarkedCount++;

      if (st === "mastered") mastered++;
      else if (st === "review_needed") reviewNeeded++;
      else unattempted++;

      if (unitStats[q.unit]) {
        unitStats[q.unit].total++;
        if (st === "mastered") unitStats[q.unit].mastered++;
        else if (st === "review_needed") unitStats[q.unit].reviewNeeded++;
        else unitStats[q.unit].unattempted++;
      }

      const isConcept = q.type === "mcq";
      const cat = isConcept ? "concept" : "calc";
      typeStats[cat].total++;
      if (st === "mastered") typeStats[cat].mastered++;
    }

    const overallMasteryPct = total > 0 ? Math.round((mastered / total) * 100) : 0;

    return {
      total,
      mastered,
      reviewNeeded,
      unattempted,
      bookmarkedCount,
      overallMasteryPct,
      unitStats,
      typeStats
    };
  }
}
