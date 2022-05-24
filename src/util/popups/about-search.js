import dispatcher from '../dispatcher';

export default function PopupAboutSearch() {
  /** @type {import("../../components/Popup").PopupPayload} */
  const popupPayload = {
    title: 'О поиске',
    messages: [
      <span key="about-search-1">
        Вы можете искать по чему захотите: ID поста, ссылка на пост, пользователя или подсайт, текстовый запрос из
        заголовка и введения статей или названия чего-либо.
      </span>,
      <span key="about-search-2">
        В поиске с помощью регулярных выражений применяются{' '}
        <a href="https://ru.wikipedia.org/wiki/PCRE" target="_blank" rel="noopener noreferrer">
          PCRE
        </a>
        . Регулярки доступны только при поиске по тексту (как их применять на URL? 😏). То же самое относится к
        регистрозависимому поиску.
      </span>,
      <span key="about-search-3">
        При поиске по дате начало и конец включаются во временной интервал. Чтобы не мучаться с временными зонами,
        отсчёт даты происходит по{' '}
        <a href="https://ru.wikipedia.org/wiki/UTC" target="_blank" rel="noopener noreferrer">
          UTC+0
        </a>
        . Однако время, указанное в постах, в комментариях, в поиске и где бы то ни было – в вашей временной зоне (т.е.
        как настроен браузер).
      </span>,
    ],
    hideable: true,
  };

  dispatcher.call('popup', popupPayload);
}
