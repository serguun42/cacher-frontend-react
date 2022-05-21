import dispatcher from '../dispatcher';

export default function PopupNoLogin() {
  /** @type {import("../../components/Popup").PopupPayload} */
  const popupPayload = {
    title: 'Кажется, вы не вошли',
    messages: [`Чтобы пользоваться кэшером TJ и DTF вам необходимо войти или зарегистрироваться.`],
    acceptText: 'Залогиниться',
    acceptAction: () => window.location.assign(process.env.REACT_APP_LOGIN_PAGE),
  };

  dispatcher.call('popup', popupPayload);
}
