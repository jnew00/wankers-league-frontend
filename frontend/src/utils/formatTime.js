export const formatTime = (timeString) => {
    if (!timeString) return "N/A";
  
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 -> 12 for midnight
    return `${formattedHours}:${String(minutes).padStart(2, "0")} ${period}`;
  };

