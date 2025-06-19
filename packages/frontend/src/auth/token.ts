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

export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;

  // decode jwt token to check expiration
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiration = payload.exp * 1000; // convert to milliseconds
    console.log(
      "Token expiration:",
      new Date(expiration).toLocaleString(),
      "Time left:",
      ((expiration - Date.now()) / 1000 / 60).toFixed(0),
      "minutes"
    );
    if (expiration < Date.now()) {
      // Token is expired
      throw new Error();
    }
    return true;
  } catch {
    signOut();
    return false;
  }
};
