class Util {
  private randomNumber: number;

  private hexValue: string;

  private readonly carFirstNames: string[];

  private readonly carSecondNames: string[];

  constructor() {
    this.randomNumber = 0;
    this.hexValue = '';
    this.carFirstNames = [
      'Lada',
      'Opel',
      'BMW',
      'Audi',
      'Mersedes',
      'Scoda',
      'Ford',
      'Chrysler',
      'Tesla',
      'Volkswagen',
    ];
    this.carSecondNames = ['Granta', 'Vesta', 'X5', 'X3', 'TT', 'Focus', 'Mustang', 'Yeti', 'Q7', 'Polo'];
  }

  public getRandomInteger(min: number, max: number) {
    this.randomNumber = Math.trunc(Math.random() * (max - min + 1)) + min;
    return this.randomNumber;
  }

  public getRandomName() {
    return `${this.carFirstNames[this.getRandomInteger(0, 9)]} ${this.carSecondNames[this.getRandomInteger(0, 9)]}`;
  }

  public getRandomColor() {
    return this.RGBtoHex(this.getRandomInteger(0, 255), this.getRandomInteger(0, 255), this.getRandomInteger(0, 255));
  }

  public RGBtoHex(first: number, second: number, third: number) {
    const firstHex = first < 16 ? `0${first.toString(16)}` : first.toString(16);
    const secondHex = second < 16 ? `0${second.toString(16)}` : second.toString(16);
    const thirdHex = third < 16 ? `0${third.toString(16)}` : third.toString(16);
    this.hexValue = `#${firstHex}${secondHex}${thirdHex}`;
    return this.hexValue;
  }
}

export default Util;
