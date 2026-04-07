export const newUserInputControl = state=>{
  let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  let wrongInputs = []
  if(state.name.length<3) wrongInputs.push('name');
  if(!emailRegex.test(state.email)) wrongInputs.push('email');
  if(state.password.length<8) wrongInputs.push('password');
  if(state.password !== state.passwordAgain) wrongInputs.push('passwordAgain');
  return {wrongInputs,isReady:wrongInputs.length===0}
}