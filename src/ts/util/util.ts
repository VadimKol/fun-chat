import Component from './component';
import { MessageOutcome } from './types';

export function formatDate(date: Date): string {
  const day = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
  const year = date.getFullYear() < 10 ? `0${date.getFullYear()}` : `${date.getFullYear()}`;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const time = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  return `${day}.${month}.${year}, ${time}`;
}

export function getFirstUnreadedMsgId(messages: MessageOutcome[], self: string): string {
  let id = '';
  messages.some((message) => {
    if (message.from !== self && !message.status.isReaded) {
      id = message.id;
      return true;
    }
    return false;
  });
  return id;
}

export function getScrollMsgId(messages: MessageOutcome[], self: string): string {
  let id = '';
  if (messages.length > 0)
    if (messages.some((message) => message.from !== self && !message.status.isReaded)) {
      const firstUnreadMsg = messages.find((message) => message.from !== self && !message.status.isReaded);
      if (firstUnreadMsg) id = firstUnreadMsg.id;
    } else {
      const lastReadMsg = messages.pop();
      if (lastReadMsg) id = lastReadMsg.id;
    }

  return id;
}

export function showError(event: Event, modalError: Component) {
  if (!(event instanceof CustomEvent)) return;

  modalError.setTextContent(event.detail);
  modalError.addClass('modal__error_show');
}
