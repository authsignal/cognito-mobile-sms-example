import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import {ReadableStream} from 'web-streams-polyfill';

// eslint-disable-next-line no-undef
globalThis.ReadableStream = ReadableStream;

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
