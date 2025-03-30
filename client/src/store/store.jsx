import { configureStore } from "@reduxjs/toolkit";

import todosReducer from "./reducers/todos";

export const store = configureStore({
    reducer: {
        todos: todosReducer,
    },
    });