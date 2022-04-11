import defaultStore from '../../assets/images/store.png';

export default (base64) => base64 ? { uri: base64 } : defaultStore;