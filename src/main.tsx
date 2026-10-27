import { render } from 'preact';
import { App } from './ui';

const root = document.getElementById('app');
if (root === null) {
  throw new Error('Missing #app root element in index.html');
}

render(<App />, root);
