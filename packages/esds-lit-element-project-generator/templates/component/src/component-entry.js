import { [ComponentName] } from './[component-name].js';

if (window.customElements.get('[component-name]') === undefined) {
  window.customElements.define('[component-name]', [ComponentName]);
}
