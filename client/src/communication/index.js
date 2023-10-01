import axios from "axios";
console.log(axios.create);

const axiosCon = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 2000,
  headers: {
    "Content-Type": "application/json",
  },
  /*transformRequest: [
    (f) => {
      console.log(JSON.stringify(f));
      if (typeof f === "object") {
        return JSON.stringify(f);
      }
      return f;
    },
  ],*/
  transformResponse: [
    (data) => {
      let res = data;
      if (typeof res == "string") {
        console.log("optimaizing data");
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
      result.data = { data: await axiosCon(requestConfig.config) };
    } else {
      result.data = await axiosCon(requestConfig);
      //console.log(result.data);
    }
    //console.log(result.data);
  } catch (err) {
    //console.log(err);

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
/*
async function d() {
  try {
    res = await sendRequest({
      method: "put",
      url: `update_task/49iJVp6K7`,
      data: {
        task_text: "Make connection work with update",
      },
      //   task_id: "12",
      //   list_id: "12345",
      //   task_text: "Make connection work with try and catch",
      // },
    });
    console.log("succsesfull");
    console.log(res.data);
    if (!res.successful) {
      throw "request not successful";
    }
  } catch (err) {
    console.log(err);
  }
}

d();*/
export { sendRequest };
//export default axiosCon;
//
/*
async function d() {
  try {
    res = await sendRequest({
      method: "put",
      url: `update_task/49iJVp6K7`,
      data: {
        task_text: "Make connection work with update",
      },
      //   task_id: "12",
      //   list_id: "12345",
      //   task_text: "Make connection work with try and catch",
      // },
    });
    console.log("succsesfull");
    console.log(res.data);
    if (!res.successful) {
      throw "request not successful";
    }
  } catch (err) {
    console.log(err);
  }

  
  let res;
  let i;
  for (i = 7; i <= 13; i++) {
    console.log("t");
    try {
      res = await sendRequest({
        method: "delete",
        url: `delete_task/${i}`,
        // data: {
        //   task_id: "12",
        //   list_id: "12345",
        //   task_text: "Make connection work with try and catch",
        // },
      });
      console.log("succsesfull");
      console.log(res.data);
      if (!res.successful) {
        status = false;
        throw "request not successful";
      }
    } catch (err) {
      console.log(err);
      break;
    }
  }
  console.log(status);
  // }
    if (i > 10) {
      break;
    }
  }
  console.log(i);
}

d();
console.log("done");
AxiosCon
  .post("/get_all_lists", {
    task_id: "sgsg",
  })
  .then(
    (res) => {
      console.log(res.data);
    },
    (err) => {
      console.log(err);
    }
  );
  */
