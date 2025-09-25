import { api } from './axios';

class ApiClient {
  constructor(http) {
    this.http = http;
  }

  request(config = {}) {
    const { method = 'get', ...rest } = config;
    return this.http.request({ method, ...rest });
  }

  get(url, config = {}) {
    return this.request({ ...config, method: 'get', url });
  }

  post(url, data, config = {}) {
    return this.request({ ...config, method: 'post', url, data });
  }

  put(url, data, config = {}) {
    return this.request({ ...config, method: 'put', url, data });
  }

  patch(url, data, config = {}) {
    return this.request({ ...config, method: 'patch', url, data });
  }

  delete(url, config = {}) {
    return this.request({ ...config, method: 'delete', url });
  }
}

const apiClient = new ApiClient(api);

export default apiClient;
export { ApiClient };
