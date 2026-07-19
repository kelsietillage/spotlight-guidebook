export const T = {
  nav: {
    home: "nav-home",
    winners: "nav-winners",
    themes: "nav-themes",
    timelines: "nav-timelines",
    nomination: "nav-nomination",
    rubric: "nav-rubric",
    tracking: "nav-tracking",
    admin: "nav-admin",
    login: "nav-login",
    logout: "nav-logout",
    print: "nav-print",
  },
  login: {
    email: "login-email",
    password: "login-password",
    submit: "login-submit",
    error: "login-error",
  },
  winners: {
    search: "winners-search",
    yearFilter: "winners-year-filter",
    categoryFilter: "winners-category-filter",
    row: (id) => `winner-row-${id}`,
    addBtn: "winners-add",
  },
  themes: {
    tab: (year) => `themes-tab-${year}`,
    editBtn: (id) => `themes-edit-${id}`,
  },
  admin: {
    tab: (name) => `admin-tab-${name}`,
    save: (coll) => `admin-save-${coll}`,
    add: (coll) => `admin-add-${coll}`,
    del: (coll, id) => `admin-del-${coll}-${id}`,
    field: (coll, id, key) => `admin-field-${coll}-${id}-${key}`,
  },
};
