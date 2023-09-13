export default axiosCon = axios.create({
  baseURL: "https://localhost:3000",
  timeout: 1000,
});

const MAXNUMOFATTEMPTS = 3;

export const sendRequest = async (requestConfig) => {
  let result; //= {status:200, data:}
  try {
    if (requestConfig.hasOwnProperty(numOfAttempts)) {
      result = await axiosCon(requestConfig.config);
    } else {
      result = await axiosCon(requestConfig);
    }
  } catch {
    if (requestConfig.hasOwnProperty(numOfAttempts)) {
      if (requestConfig.numOfAttempts < MAXNUMOFATTEMPTS - 1) {
      } else {
        result = await sendRequest({ numOfAttempts: 1, config: requestConfig });
      }
    } else {
      result = await sendRequest({ numOfAttempts: 1, config: requestConfig });
    }
  } finally {
    return result;
  }
};
