const MESSAGES = {
  corrupt: {
    title: 'Deine gespeicherten Daten lassen sich gerade nicht lesen',
    text: 'Es wurde nichts gelöscht. Wenn du einen Sicherungscode hast, kannst du deinen Stand damit wiederherstellen.',
  },
  unavailable: {
    title: 'Dein Browser lässt diese Seite gerade nichts speichern',
    text: 'Im privaten Modus passiert das manchmal. Öffne die App am besten in einem normalen Fenster oder vom Home-Bildschirm.',
  },
};

export function renderStorageError(root: HTMLElement, kind: keyof typeof MESSAGES): void {
  const title = document.createElement('h1');
  title.textContent = MESSAGES[kind].title;
  const text = document.createElement('p');
  text.textContent = MESSAGES[kind].text;

  const box = document.createElement('section');
  box.setAttribute('role', 'alert');
  box.append(title, text);
  root.replaceChildren(box);
}
