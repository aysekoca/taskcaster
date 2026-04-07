export const authControl = () => {
  let token = localStorage.getItem("refresh");
  if (!token) token = sessionStorage.getItem("refresh");
  return token;
};


export const getToken = () => {
  let token = localStorage.getItem("refresh");
  if (!token) token = sessionStorage.getItem("refresh");
  if (token) return token;
  return 0;
};
