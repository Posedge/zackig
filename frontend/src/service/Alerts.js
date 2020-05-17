import store, { showAlert, clearAlert } from '../store';


const DISPLAY_MILLIS = 5000;

class Alerts {

  constructor() {
    this.clearAlertTimeout = null;
  }

  showAlert(message, theme = 'primary') {
    store.dispatch(showAlert(message, theme));
    if (this.clearAlertTimeout) {
      clearTimeout(this.clearAlertTimeout);
    }
    this.clearAlertTimeout = setTimeout(() => store.dispatch(clearAlert()), DISPLAY_MILLIS);
  }

}

export default new Alerts();