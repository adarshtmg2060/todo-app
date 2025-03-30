import request from 'supertest';
import app from '../app';  // your Express app
import { PrismaClient, Status } from '@prisma/client';

const prisma = new PrismaClient();

let testTodoId: number;

console.log('Starting test setup...');
beforeAll(async () => {
  console.log('Connecting to Prisma...');
  await prisma.$connect();
  
  console.log('Creating test todo for GET operations...');
  const testTodo = await prisma.todos.create({
    data: {
      title: 'Test Todo for GET',
      status: 'PENDING',
      dueDate: new Date('2023-12-31'),
      Priority: 'MEDIUM',
      Tags: 'test'
    }
  });
  testTodoId = testTodo.id;
  console.log(`Created test todo with ID: ${testTodoId}`);
});

afterAll(async () => {
  console.log('Starting test cleanup...');
  console.log('Deleting all test todos...');
  await prisma.todos.deleteMany({});
  console.log('Disconnecting from Prisma...');
  await prisma.$disconnect();
  console.log('Test cleanup completed.');
});

describe('Todo API', () => {
  // Create Todo
  describe('POST /todos/create', () => {
    it('should create a new todo', async () => {
      console.log('Starting test: should create a new todo');
      const newTodo = {
        title: 'Test Todo',
        status: 'PENDING',
        dueDate: '2023-12-31',
        Priority: 'LOW',
        Tags: 'test, todo'
      };

      console.log('Sending POST request to create todo...');
      const response = await request(app)
        .post('/todos/create')
        .send(newTodo);

      console.log('Asserting response...');
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Todo created successfully');
      expect(response.body.createTodo).toMatchObject({
        title: newTodo.title,
        status: newTodo.status,
        Priority: newTodo.Priority,
        Tags: newTodo.Tags
      });
      console.log('Test completed: should create a new todo');
    });

    it('should return 400 for invalid todo data', async () => {
      console.log('Starting test: should return 400 for invalid todo data');
      const invalidTodo = {
        title: '',  // invalid empty title
        status: 'INVALID_STATUS',  // invalid status
        dueDate: 'not-a-date',
        Priority: 'INVALID_PRIORITY',
        Tags: ''
      };

      console.log('Sending POST request with invalid data...');
      const response = await request(app)
        .post('/todos/create')
        .send(invalidTodo);

      console.log('Asserting response...');
      expect(response.status).toBe(400);
      console.log('Test completed: should return 400 for invalid todo data');
    });
  });

  // Get All Todos
  describe('GET /todos', () => {
    it('should fetch all todos', async () => {
      console.log('Starting test: should fetch all todos');
      console.log('Sending GET request to fetch all todos...');
      const response = await request(app).get('/todos');

      console.log('Asserting response...');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      console.log('Test completed: should fetch all todos');
    });
  });

  // Get Todo by ID
  describe('GET /todos/:id', () => {
    it('should fetch a todo by id', async () => {
      console.log('Starting test: should fetch a todo by id');
      console.log(`Sending GET request for todo ID: ${testTodoId}...`);
      const response = await request(app).get(`/todos/${testTodoId}`);
      
      console.log('Asserting response...');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testTodoId);
      expect(response.body).toHaveProperty('title');
      console.log('Test completed: should fetch a todo by id');
    });

    it('should return 404 for non-existent todo', async () => {
      console.log('Starting test: should return 404 for non-existent todo');
      const nonExistentId = 99999;
      console.log(`Sending GET request for non-existent ID: ${nonExistentId}...`);
      const response = await request(app).get(`/todos/${nonExistentId}`);
      
      console.log('Asserting response...');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Todo not found');
      console.log('Test completed: should return 404 for non-existent todo');
    });

    it('should return 400 for invalid id format', async () => {
      console.log('Starting test: should return 400 for invalid id format');
      console.log('Sending GET request with invalid ID format...');
      const response = await request(app).get('/todos/not-a-number');
      
      console.log('Asserting response...');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid ID format');
      console.log('Test completed: should return 400 for invalid id format');
    });
  });

  // Update Todo
  describe('PUT /todos/:id', () => {
    it('should update a todo', async () => {
      console.log('Starting test: should update a todo');
      const updatedData = {
        title: 'Updated Test Todo',
        status: 'COMPLETED',
        dueDate: '2024-01-01',
        Priority: 'HIGH',
        Tags: 'updated,test'
      };

      console.log(`Sending PUT request to update todo ID: ${testTodoId}...`);
      const response = await request(app)
        .put(`/todos/${testTodoId}`)
        .send(updatedData);

      console.log('Asserting response...');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Todo updated successfully');
      expect(response.body.updateTodo.title).toBe(updatedData.title);
      expect(response.body.updateTodo.status).toBe(updatedData.status);
      console.log('Test completed: should update a todo');
    });

    it('should return 404 for non-existent todo', async () => {
      console.log('Starting test: should return 404 for non-existent todo');
      const nonExistentId = 99999;
      console.log(`Sending PUT request for non-existent ID: ${nonExistentId}...`);
      const response = await request(app)
        .put(`/todos/${nonExistentId}`)
        .send({
          title: 'Should not exist',
          status: 'PENDING',
          dueDate: '2023-12-31'
        });

      console.log('Asserting response...');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Todo not found');
      console.log('Test completed: should return 404 for non-existent todo');
    });
  });

  // Update Todo Status
  describe('PATCH /todos/:id/status', () => {
    it('should update a todo status', async () => {
      console.log('Starting test: should update a todo status');
      const newStatus = { status: 'COMPLETED'};

      console.log(`Sending PATCH request to update status for todo ID: ${testTodoId}...`);
      const response = await request(app)
        .patch(`/todos/${testTodoId}/status`)
        .send(newStatus);

      console.log('Asserting response...');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Todo status updated successfully');
      expect(response.body.updateStatus.status).toBe(newStatus.status);
      console.log('Test completed: should update a todo status');
    });

    it('should return 404 for invalid status', async () => {
      console.log('Starting test: should return 404 for invalid status');
      const invalidStatus = { status: 'INVALID_STATUS' };

      console.log(`Sending PATCH request with invalid status for todo ID: ${testTodoId}...`);
      const response = await request(app)
        .patch(`/todos/${testTodoId}/status`)
        .send(invalidStatus);

      console.log('Asserting response...');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid status');
      console.log('Test completed: should return 404 for invalid status');
    });

    it('should return 404 for non-existent todo', async () => {
      console.log('Starting test: should return 404 for non-existent todo');
      const nonExistentId = 99999;
      console.log(`Sending PATCH request for non-existent ID: ${nonExistentId}...`);
      const response = await request(app)
        .patch(`/todos/${nonExistentId}/status`)
        .send({ status: 'COMPLETED' });

      console.log('Asserting response...');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Todo not found');
      console.log('Test completed: should return 404 for non-existent todo');
    });
  });

  // Delete Todo
  describe('DELETE /todos/:id', () => {
    let todoToDeleteId: number;
  
    beforeAll(async () => {
      console.log('Setting up DELETE tests - creating todo to be deleted...');
      const todoToDelete = await prisma.todos.create({
        data: {
          title: 'Todo to be deleted',
          status: 'PENDING',
          dueDate: new Date('2023-12-31'),
          Priority: 'LOW',
          Tags: 'delete'
        }
      });
      todoToDeleteId = todoToDelete.id;
      console.log(`Created todo for deletion with ID: ${todoToDeleteId}`);
    });
  
    it('should delete a todo', async () => {
      console.log('Starting test: should delete a todo');
      console.log(`Sending DELETE request for todo ID: ${todoToDeleteId}...`);
      const response = await request(app).delete(`/todos/${todoToDeleteId}`);
      
      console.log('Asserting response...');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Todo deleted successfully');
      console.log('Test completed: should delete a todo');
    });
  
    it('should return 404 for non-existent todo', async () => {
      console.log('Starting test: should return 404 for non-existent todo');
      const nonExistentId = 12377;
      console.log(`Sending DELETE request for non-existent ID: ${nonExistentId}...`);
      const response = await request(app).delete(`/todos/${nonExistentId}`);
      
      console.log('Asserting response...');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Todo not found');
      console.log('Test completed: should return 404 for non-existent todo');
    });
  });

  // Clear Completed Todos
  describe('DELETE /todos-clear-completed', () => {
    beforeAll(async () => {
      console.log('Setting up clear completed tests - creating completed todos...');
      await prisma.todos.createMany({
        data: [
          {
            title: 'Completed Todo 1',
            status: 'COMPLETED',
            dueDate: new Date('2023-12-31'),
            Priority: 'LOW',
            Tags: 'completed'
          },
          {
            title: 'Completed Todo 2',
            status: 'COMPLETED',
            dueDate: new Date('2023-12-31'),
            Priority: 'MEDIUM',
            Tags: 'completed'
          }
        ]
      });
      console.log('Completed todos created for clear completed test');
    });

    it('should clear all completed todos', async () => {
      console.log('Starting test: should clear all completed todos');
      console.log('Sending DELETE request to clear completed todos...');
      const response = await request(app).delete('/todos-clear-completed');
      
      console.log('Asserting response...');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Completed todos cleared successfully');
      console.log('Test completed: should clear all completed todos');
    });
  });

  // 404 Not Found
  describe('Non-existent endpoint', () => {
    it('should return 404 for non-existent endpoint', async () => {
      console.log('Starting test: should return 404 for non-existent endpoint');
      console.log('Sending GET request to non-existent route...');
      const response = await request(app).get('/non-existent-route');
      
      console.log('Asserting response...');
      expect(response.status).toBe(404);
      expect(response.text).toBe('404 Not Found');
      console.log('Test completed: should return 404 for non-existent endpoint');
    });
  });
});