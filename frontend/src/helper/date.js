export const dueDateToDate = (dueDate) => {
  const dt = new Date(dueDate);
  return dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
};

export const dueTimeToTime = (dueTime) => {
  return dueTime.slice(11, 16);
};

export const dateFormater = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getWeekRange = (date = new Date()) => {
  const current = new Date(date);
  const currentDay = current.getDay();
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;

  const firstDay = new Date(current);
  firstDay.setDate(current.getDate() - distanceToMonday);

  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);

  return [firstDay, lastDay];
};

export const getMonthRange = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth(); 

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return [ firstDay, lastDay ];
};
