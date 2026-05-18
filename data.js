const DB = {
  users: [],    
  quizzes: [],  
  results: [],

  nextId: { users: 100, results: 1 }, 

  getUser(id) { return this.users.find(u => u.id === id); },
  getQuiz(id) { return this.quizzes.find(q => q.id === id); },
  getUserResults(userId) { return this.results.filter(r => r.userId === userId); },
  getQuizResults(quizId) { return this.results.filter(r => r.quizId === quizId); },
  getUserQuizResult(userId, quizId) { return this.results.find(r => r.userId === userId && r.quizId === quizId); },
  getAssignedQuizzes(userId) { return this.quizzes.filter(q => q.assignedTo.includes(userId)); },

  addResult(result) {
    result.id = this.nextId.results++;
    this.results.push(result);
    return result;
  },

  addUser(user) {
    user.id = this.nextId.users++;
    this.users.push(user);
    return user;
  },

  removeUser(id) {
    this.users = this.users.filter(u => u.id !== id);
    this.quizzes.forEach(q => { q.assignedTo = q.assignedTo.filter(uid => uid !== id); });
  },

  removeQuiz(id) {
    this.quizzes = this.quizzes.filter(q => q.id !== id);
    this.results = this.results.filter(r => r.quizId !== id);
  }
};
