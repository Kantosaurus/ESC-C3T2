export const getToken = () => {
  return localStorage.getItem("carely-token");
};

export const setToken = (token: string) => {
  localStorage.setItem("carely-token", token);
};

export const signOut = () => {
  localStorage.removeItem("carely-token");
  window.location.href = "/login";
};
