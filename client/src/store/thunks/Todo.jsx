import axios from "axios";
import { toast } from "react-toastify";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "http://localhost:7070";

export const fetchTodos = createAsyncThunk("todos/", async () => {
    try {
        const response = await axios.get(`${BASE_URL}/todos`);
        return response.data.todos;
    } catch (error) {
        toast.error("Error fetching todos");
        console.error("Error fetching todos:", error);
    }
    }
);



