const Auth = {
  currentUser: null,

  async login(email, password) {
    try {
      const user = await API.login(email, password);
      this.currentUser = user;
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  logout() {
    this.currentUser = null;
    API.logout();
  },

  isLoggedIn()  { return !!this.currentUser && !!API.getToken(); },
  isAdmin()     { return this.currentUser?.role === 'admin'; },
  isEmployee()  { return this.currentUser?.role === 'employee'; }
};
