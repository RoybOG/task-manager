import { createSlice } from "@reduxjs/toolkit";



function removeElementFromArray(arr, ind){
    if(ind == undefined) return arr;
    const arrBefore = arr.slice(0,ind)
    const arrAfter = arr.slice(ind+1)
    return arrBefore.concat(arrAfter)

}

const taskSlice = createSlice({
    name: 'tasks',
    initialState:  [
            {},
             {
               text: "Create task app",
             },
            // {
            //   text: "Feed the Dog!",
            // },
          ]
    ,
    reducers: {
        addEmptyTask: state=> {
            state.unshift({})
        },
        UpdateTask: (state, action) =>{
            // console.log('updating ')
            // console.dir(action)
            const taskInfo = action.payload
            state[taskInfo.id].text = taskInfo.text
        },
        deleteTask: (state,action)=>{
            // console.log('delete ')
            
            const newstate = removeElementFromArray(state, action.payload)
            // console.log(newstate)
            return newstate
        }
        
    }
})


export const {deleteTask, UpdateTask, addEmptyTask } = taskSlice.actions

export default taskSlice.reducer