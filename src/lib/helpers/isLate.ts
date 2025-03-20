export const isLate = (date: Date): boolean => {
    try {
      const today = new Date();
      const realDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      return realDateTime < today;
    } catch (e) {
      console.error(e, date)
      return false
    }
  }