export const removeRefreshFromStorage = () => {
  localStorage.removeItem("refresh");
  sessionStorage.removeItem("refresh");
};
