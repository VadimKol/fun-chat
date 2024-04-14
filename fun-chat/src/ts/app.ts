import Garage from './garage/garage';
import Winners from './winners/winners';

class App {
  private body: HTMLElement;

  constructor() {
    this.body = document.body;
    this.body.classList.add('body');
  }

  public start(): void {
    const garage = new Garage();
    this.body.append(garage.create());
    const winners = new Winners();
    this.body.append(winners.create());
    this.body.addEventListener('createWinner', () => winners.addWinnerInfo(garage.winner));
    this.body.addEventListener('deleteWinner', () => winners.deleteWinnerInfo(garage.winner));
    this.body.addEventListener('updateWinner', () => winners.updateWinnerInfo());
  }
}

export default App;
