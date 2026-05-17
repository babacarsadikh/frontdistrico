export class Utils {
    static isMobile() {
        return window && window.matchMedia('(max-width: 767px)').matches;
    }
    static ngbDateToDate(ngbDate: { month, day, year }) {
        if (!ngbDate) {
            return null;
        }
        return new Date(`${ngbDate.month}/${ngbDate.day}/${ngbDate.year}`);
    }
    static dateToNgbDate(date: Date): any {
      if (!date) {
          return null;
      }
      date = new Date(date);

      // Format la date en YYYY/MM/DD
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ajoute un zéro devant si nécessaire
      const day = date.getDate().toString().padStart(2, '0'); // Ajoute un zéro devant si nécessaire

      return { year, month: parseInt(month), day: parseInt(day) }; // Retourne un objet compatible avec NgbDate
  }

    // static dateToNgbDate(date: Date) {
    //     if (!date) {
    //         return null;
    //     }
    //     date = new Date(date);
    //     //return { month: date.getMonth() + 1, day: date.getDate(), year: date.getFullYear() };
    //     return {  year: date.getFullYear() ,month: date.getMonth() + 1,day: date.getDate()};

    // }
    static scrollToTop(selector: string) {
        if (document) {
            const element = <HTMLElement>document.querySelector(selector);
            element.scrollTop = 0;
        }
    }
    static genId() {
      return Math.floor(Math.random() * 100000); // Generates a random integer between 0 and 99999
  }
}
