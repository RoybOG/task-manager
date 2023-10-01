const g = { a: 1, b: 2, c: 3 };
const { a } = { ...g };
console.log(a);
/*

import axios from "axios";
console.log(typeof axios.create);
const axiosCon = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 2000,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log();
async function create_task() {
  try {
    return await axiosCon({
      method: "get",
      url: "get_all_lists",
      /*data: {
        task_id: "8",
        list_id: "12345",
        task_text: "Make connection work with try and catch",
      },
    });
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}

create_task();

axiosCon({
    method: "post",
    url: "create_task",
    data: {
      task_id: "6",
      list_id: "12345",
      task_text: "Make connection work with config and general",
    },
  }).then(
  function(response) {
    console.log(response.data);
  },
  function(response) {
    console.dir(response);
  }
);


axiosCon
  .post("create_task", {
    task_id: "5",
    list_id: "12345",
    task_text: "Make connection work with config",
  })
  .then(
    function(response) {
      console.log(response.data);
    },
    function(response) {
      console.dir(response);
    }
  );

axios
  .post("http://localhost:5000/create_task", {
    task_id: "3",
    list_id: "12345",
    task_text: "Make connection work",
  })
  .then(
    function(response) {
      console.log(response.data);
    },
    function(response) {
      console.dir(response);
    }
  );
*/
