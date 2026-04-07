export const removeRefresh = () => {
  localStorage.removeItem("refresh");
  sessionStorage.removeItem("refresh");
};

export const getUserRole = () => {
  let val = localStorage.getItem("isAdmin");
  return val ? Number(val) : 0;
};
