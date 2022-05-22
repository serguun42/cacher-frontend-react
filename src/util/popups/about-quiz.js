import dispatcher from '../dispatcher';

export default function PopupAboutQuiz() {
  /** @type {import("../../components/Popup").PopupPayload} */
  const popupPayload = {
    title: 'Об опросах и результатах',
    messages: [
      `Это блок опроса. Чтобы узнать результаты, кроулеру необходимо делать запрос на каждый
      такой блок по отдельности – а это очень много и даже бессмысленно. Поэтому без результатов 🤷‍♂️.`,
    ],
    hideable: true,
  };

  dispatcher.call('popup', popupPayload);
}
