export const writeTokenToStorage = (token)=>{
  if(localStorage.getItem('refresh') != null){
    localStorage.setItem('refresh',token)
    return;
  }
  sessionStorage.setItem('refresh',token);
}