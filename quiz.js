// ===========================
// QUIZ ENGINE — EduTest LMS
// ===========================

const QuizEngine = {
  activeQuiz: null,
  answers: {},
  currentQ: 0,
  timerInterval: null,
  timeLeft: 0,
  onTimeUp: null,
  onTick: null,

  start(quiz) {
    this.activeQuiz = {
      ...quiz,
      questions: this._shuffle([...quiz.questions])
    };
    this.answers = {};
    this.currentQ = 0;
    this.timeLeft = quiz.timeLimit * 60;
    return this.activeQuiz;
  },

  startTimer(onTick, onTimeUp) {
    this.onTick = onTick;
    this.onTimeUp = onTimeUp;
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.onTick) this.onTick(this.timeLeft);
      if (this.timeLeft <= 0) {
        this.stopTimer();
        if (this.onTimeUp) this.onTimeUp();
      }
    }, 1000);
  },

  stopTimer() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
  },

  answer(questionId, optionIndex) {
    this.answers[questionId] = optionIndex;
  },

  submit() {
    const quiz = this.activeQuiz;
    if (!quiz) return null;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const detailedAnswers = [];

    quiz.questions.forEach(q => {
      const given = this.answers[q.id];
      if (given === undefined || given === null) {
        skipped++;
        detailedAnswers.push({ questionId: q.id, given: null, correct: q.correct, isCorrect: false });
      } else if (given === q.correct) {
        correct++;
        detailedAnswers.push({ questionId: q.id, given, correct: q.correct, isCorrect: true });
      } else {
        wrong++;
        detailedAnswers.push({ questionId: q.id, given, correct: q.correct, isCorrect: false });
      }
    });

    const total = quiz.questions.length;
    const score = Math.round((correct / total) * 100);
    const passed = score >= quiz.passingScore;
    const timeUsed = (quiz.timeLimit * 60) - this.timeLeft;

    this.stopTimer();

    return {
      userId: Auth.currentUser.id,
      quizId: quiz.id,
      score,
      correctCount: correct,
      wrongCount: wrong,
      skippedCount: skipped,
      passed,
      timeUsed,
      date: new Date().toISOString(),
      answers: detailedAnswers
    };
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  },

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
};
