const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE = isLocalhost
  ? 'http://localhost/smart-feeder/api'
  : `http://${window.location.hostname}/smart-feeder/api`;

export { API_BASE };