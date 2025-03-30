"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const validation_1 = require("./middlewares/validation");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// interface Todo
var Status;
(function (Status) {
    Status["PENDING"] = "PENDING";
    Status["COMPLETED"] = "COMPLETED";
})(Status || (Status = {}));
var Priority;
(function (Priority) {
    Priority["LOW"] = "LOW";
    Priority["MEDIUM"] = "MEDIUM";
    Priority["HIGH"] = "HIGH";
})(Priority || (Priority = {}));
// Zod schema for validation
const todosSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title is required"),
    status: zod_1.z.enum([
        Status.PENDING,
        Status.COMPLETED,
    ]).default(Status.PENDING),
    dueDate: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
        .transform((val) => new Date(val)),
    Priority: zod_1.z.enum([
        Priority.LOW,
        Priority.MEDIUM,
        Priority.HIGH,
    ]).default(Priority.LOW),
    Tags: zod_1.z.string().optional().default(''),
});
app.get('/todos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todos = yield prisma.todos.findMany();
        res.status(200).json(todos);
    }
    catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.get('/todos/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10); // Ensure the ID is an integer.
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const todo = yield prisma.todos.findUnique({
            where: {
                id: id,
            },
        });
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.status(200).json(todo);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
app.post('/todos/create', (0, validation_1.validate)(todosSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, status, dueDate, Priority, Tags } = req.body;
    try {
        const createTodo = yield prisma.todos.create({
            data: {
                title,
                status,
                dueDate: new Date(dueDate),
                Priority,
                Tags,
            },
        });
        res.status(201).json({ message: 'Todo created successfully', createTodo });
    }
    catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
}));
app.put('/todos/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    const { title, status, dueDate, Priority, Tags } = req.body;
    // check if todo exists
    const todo = yield prisma.todos.findUnique({
        where: { id },
    });
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    try {
        const updateTodo = yield prisma.todos.update({
            where: { id },
            data: {
                title,
                status,
                dueDate: new Date(dueDate),
                Priority,
                Tags,
            },
        });
        res.status(200).json({ message: 'Todo updated successfully', updateTodo });
    }
    catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.delete('/todos/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    // Validate ID
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    // check if todo exists
    const todo = yield prisma.todos.findUnique({
        where: { id },
    });
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    try {
        yield prisma.todos.delete({
            where: { id },
        });
        return res.status(200).json({ message: 'Todo deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}));
app.delete('/todos-clear-completed', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.todos.deleteMany({
            where: {
                status: Status.COMPLETED,
            },
        });
        res.status(200).json({ message: 'Completed todos cleared successfully' });
    }
    catch (error) {
        console.error('Error clearing completed todos:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.patch('/todos/:id/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    const todo = yield prisma.todos.findUnique({
        where: { id },
    });
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    const { status } = req.body;
    // check if valid status 
    if (!Object.values(Status).includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    try {
        const updateStatus = yield prisma.todos.update({
            where: { id },
            data: { status },
        });
        res.status(200).json({ message: 'Todo status updated successfully', updateStatus });
    }
    catch (error) {
        console.error('Error updating todo status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});
exports.default = app;
