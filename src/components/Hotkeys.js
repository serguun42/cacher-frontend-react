import './Hotkeys.css';

const HOTKEYS = [
  { buttons: ['Esc'], description: `Скрыть попап, медиа-просмотрощик или сообщение в верху страницы` },
  { buttons: ['S'], description: `Открыть поиск` },
  { buttons: ['Enter'], description: `Найти по заданному поисковому запросу` },
  { buttons: ['Shift', '?'], description: `Показать горячие клавиши` },
];

export default function Hotkeys() {
  return HOTKEYS.map((hotkey) => (
    <div className="hotkey-line" key={`hotkey-${hotkey.buttons.join('')}-${hotkey.description}`}>
      <div className="hotkey-buttons default-no-select">
        {hotkey.buttons.map((button) => (
          <div className="hotkey-button" key={`hotkey-${hotkey.buttons.join('')}-${button}`}>
            {button}
          </div>
        ))}
      </div>
      <div className="hotkey-description">{hotkey.description}</div>
    </div>
  ));
}
