import Cookies from 'universal-cookie';

const cookies = new Cookies();

export default class API {

  static call(method, path, body, headers) {
    headers = headers || {};
    if (method === 'POST' || method === 'PUT') {
      headers['Content-Type'] = 'application/json;coding=utf-8';
    }
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      headers['X-CSRF-TOKEN'] = cookies.get('csrf_access_token');
    }
    if (body) {
      body = JSON.stringify(body);
    }
  
    return new Promise((resolve, reject) => {
      fetch(new Request(`${window.config.API_URL}${path}`, {method, headers, body, credentials: 'include'}))
        .then(response => {
          // Await json body, and attach response status to promise
          return Promise.all([
            response.json(),
            Promise.resolve(response.status)
          ]);
        })
        .then(values => {
          // Reject on non-2xx response status
          const [body, status] = values;
          if (status >= 400) {
            const err = new Error((body && body.message) || `Response status: ${status}`);
            err.status = status;
            err.body = body;
            reject(err);
          } else {
            resolve(body, status);
          }
        })
        .catch(err => {
          // Other errors, including network errors
          reject(err);
        });
    });

  }

}