import './content-view.scss';
import View from '../../view';
import ContactsView from './contacts/contacts-view';
import DialogView from './dialog/dialog-view';

export default class ContentView extends View {
  constructor() {
    const params = {
      tag: 'section',
      className: 'content',
    };
    super(params);
    this.setContent();
  }

  setContent() {
    const contacts = new ContactsView();
    const dialog = new DialogView();
    this.viewElementCreator.appendChildren([contacts.getComponent(), dialog.getComponent()]);
  }
}
