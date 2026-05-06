// ===========================
// AUTH MODULE — EduTest LMS
// ===========================

const Auth = {
  currentUser: null,

  login(email, password) {
    const user = DB.users.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, error: 'Email atau password salah.' };
    this.currentUser = user;
    return { success: true, user };
  },

  logout() { this.currentUser = null; },

  isLoggedIn() { return !!this.currentUser; },
  isAdmin() { return this.currentUser?.role === 'admin'; },
  isEmployee() { return this.currentUser?.role === 'employee'; }
};
