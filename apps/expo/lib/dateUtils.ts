export const isValidAlarmTime = (time: Date): boolean => {
  const now = new Date();
  return time > now;
};
