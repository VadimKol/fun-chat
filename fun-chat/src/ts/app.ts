// import LoginView from './login/login-view';
// import AboutView from './about/about-view';
import ChatView from './chat/chat-view';

class App {
  private body: HTMLElement;

  constructor() {
    this.body = document.body;
    this.body.classList.add('body');
  }

  public start(): void {
    // const login = new LoginView();
    // const about = new AboutView();
    const chat = new ChatView();
    // this.body.append(login.getHtmlElement());
    this.body.append(chat.getHtmlElement());
    // this.body.addEventListener('updateWinner', () => winners.updateWinnerInfo());
  }
}

export default App;
