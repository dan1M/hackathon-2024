export const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0]; // Convertir en format YYYY-MM-DD
  };
  
  export const isSameDay = (date1, date2) => {
    return date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0];
  };
  