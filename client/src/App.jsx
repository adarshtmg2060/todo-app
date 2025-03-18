import React from 'react'

const App = () => {
  return (
    <div>
      <h1 className='todo-header'>To-Do App</h1>
      <div class="container">
          <div class="task-input-container">
              <input type="text" id="taskInput" placeholder="Add new task..." />
              <button id="addTaskBtn">Add</button>
          </div>
          <table>
              <thead>
                  <tr>
                      <th>Status</th>
                      <th>Task</th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td><input type="checkbox" /></td>
                      <td>Task 1</td>
                      <td>
                        <button class="action-btn" onclick="editTask(this)">Edit</button>
                        <button class="action-btn" onclick="deleteTask(this)">Delete</button>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
    </div>
  )
}

export default App