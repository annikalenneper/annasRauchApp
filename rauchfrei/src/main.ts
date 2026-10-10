import './styles/main.css';
import { loadState, requestPersistence } from './storage/store';
import { renderStorageError } from './views/storage-error';

const root = document.querySelector<HTMLElement>('#app');
const loaded = loadState();

if (root && (loaded.status === 'corrupt' || loaded.status === 'unavailable')) {
  renderStorageError(root, loaded.status);
}

void requestPersistence(navigator.storage);
