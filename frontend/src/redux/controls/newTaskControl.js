export const newTaskValuesControl = (state)=>{
  return state.title.length !== 0 && state.dueDate !== '' && state.dueTime !== ''; 
}