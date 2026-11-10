import axios from "axios"

const API= axios.create({
  baseURL:"http://localhost:5000/api/tasks",
})

API.interceptors.request.use((config)=>{
  const token = localStorage.getItem("token");

  if(token){
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
})

export const getTasks=()=>API.get("/");

export const createTask = (taskData)=>API.post("/",taskData);

export const updateTask = (id, taskData)=>
  API.put(`/${id}`,taskData)

export const deleteTask = (id) => API.delete(`/${id}`)