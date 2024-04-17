import './contacts-view.scss';
import { ul, input } from '../../../../util/tags';
import View from '../../../view';

export default class ContactsView extends View {
  constructor() {
    const params = {
      tag: 'aside',
      className: 'contacts',
    };
    super(params);
    this.setContent();
  }

  setContent() {
    this.viewElementCreator.appendChildren([
      input('contacts__search', ContactsView.searchUser.bind(this), 'text', 'Search...'),
      ul('contacts__users'),
    ]);
  }

  public static searchUser() {}
}