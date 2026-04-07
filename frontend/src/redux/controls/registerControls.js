export const registerInputControls = (state) => {
  let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  let nameRegex = /^[a-zA-Z\s]{3,28}$/;
  let wrongInputs = [];
  if (
    state.name.length < 3 ||
    state.name.length > 50 ||
    !nameRegex.test(state.name)
  )
    wrongInputs.push("name");
  if (state.email.length < 3 || !emailRegex.test(state.email) || state.email.length >255)
    wrongInputs.push("email");
  if (state.password.length < 8 || state.password.length > 255)
    wrongInputs.push("password");
  if (state.password !== state.passwordAgain) wrongInputs.push("passwordAgain");
  return { wrongInputs, isReady: wrongInputs.length === 0 }; 
};