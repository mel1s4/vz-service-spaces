import axios from 'axios';

async function api(method, endpoint, data = {}) {
  const blogUrl = window.vz_blog_url ?? 'http://localhost/';
  const nonce = window.vz_nonce ?? '';
  try {
    const response = await axios({
      method: method,
      url: `${blogUrl}/wp-json/vz-ss/v1/${endpoint}`,
      data: data,
      // headers: {
      //   'X-WP-Nonce': nonce
      // }
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export { api };