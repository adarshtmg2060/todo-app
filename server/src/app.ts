import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validate } from './middlewares/validation';
 
const app = express();

const prisma = new PrismaClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// interface Todo
enum Status {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}
enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}
interface Todo {
  id: number;
  title: string;
  status: Status;
  dueDate: Date;
  Priority: Priority;
  Tags?: string;
}


// Zod schema for validation
const todosSchema = z.object({
  title: z.string().min(3, "Title is required"),
  status: z.enum([
    Status.PENDING,
    Status.COMPLETED,
  ]).default(Status.PENDING),
  dueDate: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Invalid date format"
    )
    .transform((val) => new Date(val)),
  Priority: z.enum([
    Priority.LOW,
    Priority.MEDIUM,
    Priority.HIGH,
  ]).default(Priority.LOW),
  Tags: z.string().optional().default(''),
});


 
app.get('/todos', async (req: Request, res: Response) => {
  try {
    const todos = await prisma.todos.findMany();
    res.status(200).json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/todos/:id', async (req: Request, res: Response):Promise<any> => {
  try {
    const id = parseInt(req.params.id, 10); // Ensure the ID is an integer.
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const todo = await prisma.todos.findUnique({
      where: {
        id: id,
      },
    });
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/todos/create', validate(todosSchema), async (req: Request, res: Response) => {
  const { title, status, dueDate, Priority, Tags }: Todo = req.body;

  try {
    const createTodo = await prisma.todos.create({
      data: {
        title,
        status,
        dueDate: new Date(dueDate),
        Priority,
        Tags,
      },
    });
    res.status(201).json({message: 'Todo created successfully', createTodo});
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }

});

app.put('/todos/:id', async (req: Request, res: Response):Promise<any> => {
  const id = parseInt(req.params.id, 10);
  const { title, status, dueDate, Priority, Tags }: Todo = req.body;

  // check if todo exists
  const todo = await prisma.todos.findUnique({
    where: { id },
  });
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  try {
    const updateTodo = await prisma.todos.update({
      where: { id },
      data: {
        title,
        status,
        dueDate: new Date(dueDate),
        Priority,
        Tags,
      },
    });
    res.status(200).json({message: 'Todo updated successfully', updateTodo});
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/todos/:id', async (req: Request, res: Response):Promise<any> => {
  const id = parseInt(req.params.id, 10);

  // Validate ID
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  // check if todo exists
  const todo = await prisma.todos.findUnique({
    where: { id },
  });
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  try {
    await prisma.todos.delete({
      where: { id },
    });
    return res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error:any) { 
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/todos-clear-completed', async (req: Request, res: Response) => {
  try {
    await prisma.todos.deleteMany({
      where: {
        status: Status.COMPLETED,
      },
    });
    res.status(200).json({ message: 'Completed todos cleared successfully' });
  } catch (error) {
    console.error('Error clearing completed todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
 
app.patch('/todos/:id/status', async (req: Request, res: Response):Promise<any> => {
  const id = parseInt(req.params.id, 10);
  const todo = await prisma.todos.findUnique({
    where: { id },
  });
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  const { status }: { status: Status } = req.body;
  // check if valid status 

  if (!Object.values(Status).includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const updateStatus = await prisma.todos.update({
      where: { id },
      data: { status },
    });
    res.status(200).json({message: 'Todo status updated successfully', updateStatus});
  } catch (error) {
    console.error('Error updating todo status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use((req: Request, res: Response) => {
  res.status(404).send('404 Not Found');
});

export default app;
