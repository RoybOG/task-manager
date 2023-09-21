const axios = require("axios");

const axiosCon = new axios.Axios({
  baseURL: "http://localhost:5000",
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
  },
  transformResponse: [
    (data) => {
      let res = data;
      if (typeof res == "string") {
        try {
          res = JSON.parse(res);
        } catch (error) {
          console.log(error);
          return data;
        }
      }
      return res;
    },
  ],
});
// console.log(axiosCon);
const MAXNUMOFATTEMPTS = 3;
const sendRequest = async (requestConfig) => {
  let result = { successful: true, data: null };
  try {
    if (requestConfig.hasOwnProperty("numOfAttempts")) {
      result.data = { data: await axiosCon.request(requestConfig.config) };
    } else {
      result.data = await axiosCon.request(requestConfig);
      console.log(typeof result.data);
      return result;
    }
  } catch (err) {
    console.log(err);

    if (requestConfig.hasOwnProperty("numOfAttempts")) {
      if (requestConfig.numOfAttempts == MAXNUMOFATTEMPTS) {
        result = { successful: false, data: err };
      } else if (requestConfig.numOfAttempts < MAXNUMOFATTEMPTS) {
        result = await sendRequest({
          ...requestConfig,
          numOfAttempts: requestConfig.numOfAttempts + 1,
        });
      }
    } else {
      result = await sendRequest({ numOfAttempts: 1, config: requestConfig });
    }
  } finally {
    return result;
  }
};

export { sendRequest };
//export default axiosCon;
/*
sendRequest({ method: "get", url: "/get_all_lists" }).then(
  (res) => {
    console.log(res.data);
  },
  (err) => {
    console.log(err);
  }
);*/
