export const loginInputsControl = (values)=>{
  let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  let isReady = true;
  let wrongInputs = [];
  if(!emailRegex.test(values.email)){
    isReady = false;
    wrongInputs.push('email');
  }
  if(values.password.length<8 || values.password.length>255){
    isReady = false;
    wrongInputs.push('password');
  }
  return {isReady,wrongInputs}
}

export const afterLogin = (data,rememberme) => {
  localStorage.setItem('isAdmin',data.role);
  if(rememberme) localStorage.setItem('refresh',data.refresh);  // writing token in localstorage
  else sessionStorage.setItem('refresh',data.refresh);  // writing token in Sessionstorage
}