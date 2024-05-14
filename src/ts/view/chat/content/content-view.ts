import './content-view.scss';
import View from '../../view';
import ContactsView from './contacts/contacts-view';
import DialogView from './dialog/dialog-view';
import ServerConnection from '../../../server-connection/server-connection';
import Router from '../../../router/router';
import Component from '../../../util/component';

export default class ContentView extends View {
  constructor(serverConnection: ServerConnection, router: Router, modalError: Component) {
    const params = {
      tag: 'section',
      className: 'content',
    };
    super(params);
    this.setContent(serverConnection, router, modalError);
  }

  setContent(serverConnection: ServerConnection, router: Router, modalError: Component) {
    const contacts = new ContactsView(serverConnection, router, modalError);
    const dialog = new DialogView(this.getComponent(), serverConnection, router, modalError, contacts);
    this.viewElementCreator.appendChildren([contacts.getComponent(), dialog.getComponent()]);
  }
}
