import dispatcher from '../dispatcher';

export default function PopupNoPermission() {
  /** @type {import("../../components/Popup").PopupPayload} */
  const popupPayload = {
    title: 'Кажется, у вас недостаточно прав',
    messages: [
      `Чтобы пользоваться кэшером TJ и DTF вам необходимо не только войти или
      зарегистрироваться, но и иметь соответствующие права пользователя.
      Вы можете запросить у меня их напрямую.`,
    ],
    acceptText: 'Запросить доступ',
    acceptAction: () => window.location.assign(process.env.REACT_APP_REQUEST_PAGE),
  };

  dispatcher.call('popup', popupPayload);
}
