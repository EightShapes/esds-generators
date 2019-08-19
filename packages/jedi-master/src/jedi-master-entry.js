import { JediMaster } from './jedi-master.js';

if (window.customElements.get('jedi-master') === undefined) {
  window.customElements.define('jedi-master', JediMaster);
}
