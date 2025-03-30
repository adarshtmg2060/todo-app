import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {toast} from 'react-toastify';

const SERVER_URL = "http://localhost:7070";

export const fetchTodos = createAsyncThunk("todos/fetchTodos", async () => {
    try {
        const response = await axios.get(`${SERVER_URL}/todos`);
        console.log(response.data.todos);
        console.log("test");
        return response.data.todos;
    } catch (error) {
        toast.error("Failed to fetch todos");
    }
    });

export const addTodo = createAsyncThunk("todos/addTodo", async (task) => {
    try {
        const response = await axios.post(`${SERVER_URL}/todos`, { task });
        return response.data;
    } catch (error) {
        toast.error("Failed to add todo");
    }
});

export const updateTodo = createAsyncThunk("todos/updateTodo", async (todo) => {
    try {
        const response = await axios.put(`${SERVER_URL}/todos/${todo.id}`, todo);
        return response.data;
    } catch (error) {
        toast.error("Failed to update todo");
    }
});


export const deleteTodo = createAsyncThunk("todos/deleteTodo", async (id) => {
    try {
        await axios.delete(`${SERVER_URL}/todos/${id}`);
        return id;
    } catch (error) {
        toast.error("Failed to delete todo");
    }
});

export const toggleStatus = createAsyncThunk("todos/toggleStatus", async (todo) => {
    try {
        const response = await axios.put(`${SERVER_URL}/todos/${todo.id}`, todo);
        return response.data;
    } catch (error) {
        toast.error("Failed to toggle status");
    }
});



