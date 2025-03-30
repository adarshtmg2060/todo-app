import React from "react";

const App = () => {
  return (
    <>
      <button class="dark-mode-toggle" id="dark-mode-toggle">
        <i class="fas fa-moon"></i>
      </button>

      <div class="container">
        <header>
          <h1>Todo App</h1>
          <div class="input-container">
            <input
              type="text"
              id="todo-input"
              placeholder="Add a new task..."
            />
            <button id="add-btn">
              <i class="fas fa-plus"></i> Add
            </button>
          </div>

          <div class="todo-options">
            <div class="option-group">
              <span class="option-label">Due Date:</span>
              <input type="date" id="due-date" />
            </div>

           

            <div class="option-group">
              <span class="option-label">Priority:</span>
              <div class="priority-selector">
                <button
                  class="priority-btn priority-low"
                  data-priority="low"
                  title="Low"
                ></button>
                <button
                  class="priority-btn priority-medium"
                  data-priority="medium"
                  title="Medium"
                ></button>
                <button
                  class="priority-btn priority-high active"
                  data-priority="high"
                  title="High"
                ></button>
              </div>
            </div>

            <div class="option-group tag-input-container">
              <span class="option-label">Tags:</span>
              <input type="text" id="tag-input" placeholder="Add tag..." />
              <div class="tag-list" id="tag-list"></div>
            </div>
          </div>
        </header>

        <div class="filters">
          <button class="filter-btn active" data-filter="all">
            All
          </button>
          <button class="filter-btn" data-filter="active">
            Active
          </button>
          <button class="filter-btn" data-filter="completed">
            Completed
          </button>
          <button class="filter-btn" data-filter="today">
            Due Today
          </button>
          <button class="filter-btn" data-filter="upcoming">
            Upcoming
          </button>
        </div>

        <ul id="todo-list"></ul>

        <div class="stats">
          <span id="remaining-count">0</span> tasks left
          <button id="clear-completed">Clear Completed</button>
        </div>
      </div>
    </>
  );
};

export default App;
