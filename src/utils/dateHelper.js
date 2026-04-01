export const getMeetingDateTime = (dateString, timeString) => {
  // 1. Date string se Year, Month, Day nikalna (T se pehle ka hissa)
  // "2026-03-30T00:00:00.000Z" -> ["2026", "03", "30"]
  const [year, month, day] = dateString.split('T')[0].split('-');

  // 2. Time string se Hours aur Minutes nikalna
  // "07:00 PM" -> time="07:00", modifier="PM"
  const [time, modifier] = timeString.split(' ');
  let [hours, minutes] = time.split(':');
  
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);

  // 12-hour format ko 24-hour format mein convert karna
  if (hours === 12) {
    hours = 0;
  }
  if (modifier === 'PM') {
    hours = hours + 12;
  }

  // 3. Ek naya Local Date object return karna (Month 0-indexed hota hai JS me, isliye month - 1)
  return new Date(year, month - 1, day, hours, minutes, 0);
};