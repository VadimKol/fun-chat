import AboutView from './about/about-view';
// import LoginView from './login/login-view';

class App {
  private body: HTMLElement;

  constructor() {
    this.body = document.body;
    this.body.classList.add('body');
  }

  public start(): void {
    // const login = new LoginView();
    const about = new AboutView();
    // this.body.append(login.getHtmlElement());
    this.body.append(about.getHtmlElement());
    // this.body.addEventListener('updateWinner', () => winners.updateWinnerInfo());
  }
}

export default App;
