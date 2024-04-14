import Winners from './winners/winners';

class App {
  private body: HTMLElement;

  constructor() {
    this.body = document.body;
    this.body.classList.add('body');
  }

  public start(): void {
    const winners = new Winners();
    this.body.append(winners.create());
    this.body.addEventListener('updateWinner', () => winners.updateWinnerInfo());
  }
}

export default App;
