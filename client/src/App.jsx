import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { format, isToday, isAfter, parseISO } from "date-fns";
import { Tooltip } from "react-tooltip";

const App = () => {
  const PRIORITY = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
  };
  const STATUS = {
    COMPLETED: "completed",
  };

  function formatDate(date) {
    return format(new Date(date), "dd-MM-yyyy");
  }

  const BASE_URL = "http://localhost:7070";
  const [todos, setTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remainingTask, setRemainingTask] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: "",
    dueDate: today,  // Set default date
    status: "PENDING",
    Priority: "LOW",
    Tags: "",
  });

  const fetchAllTodos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/todos`);
      setTodos(response.data);
      setFilteredTodos(response.data); // Initialize filtered todos
      
      // Calculate remaining tasks
      const remaining = response.data.filter(todo => todo.status !== "COMPLETED").length;
      setRemainingTask(remaining);
    } catch (err) {
      console.log(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTodos();
  }, []);

  // Apply filters whenever todos or activeFilter changes
  useEffect(() => {
    let filtered = [...todos];
    
    switch (activeFilter) {
      case "active":
        filtered = filtered.filter(todo => todo.status !== "COMPLETED");
        break;
      case "completed":
        filtered = filtered.filter(todo => todo.status === "COMPLETED");
        break;
      case "today":
        filtered = filtered.filter(todo => isToday(parseISO(todo.dueDate)));
        break;
      case "upcoming":
        filtered = filtered.filter(todo => 
          isAfter(parseISO(todo.dueDate), new Date()) && 
          !isToday(parseISO(todo.dueDate)));
        break;
      default:
        // "all" - no filtering needed
        break;
    }
    
    setFilteredTodos(filtered);
    
    // Update remaining tasks count (only for active filter)
    if (activeFilter === "all" || activeFilter === "active") {
      const remaining = filtered.filter(todo => todo.status !== "COMPLETED").length;
      setRemainingTask(remaining);
    }
  }, [todos, activeFilter]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    async function createTodos() {
      try {
        const res = await axios.post(`${BASE_URL}/todos/create`, formData);
        toast.success(res.data.message);
        fetchAllTodos();
        setFormData({
          title: "",
          dueDate: today,  // Reset to default date
          status: "PENDING",
          Priority: "LOW",
          Tags: "",
        });
      } catch (e) {
        toast.error(e.response.data.error);
      }
    }
    createTodos();
  }

  function handleChecked(e) {
    const id = e.target.value;
    async function taskCompleted(id) {
      try {
        const res = await axios.patch(`${BASE_URL}/todos/${id}/status`, {
          status: "COMPLETED",
        });
        if (res.status === 200) {
          toast.success("Task Completed");
          fetchAllTodos();
        }
      } catch (e) {
        toast.error(e.response.data.error);
      }
    }
    taskCompleted(id);
  }

  function handleTaskDelete(id) {
    async function deleteTodos(id) {
      try {
        const res = await axios.delete(`${BASE_URL}/todos/${id}`);
        toast.success(res.data.message);
        fetchAllTodos();
      } catch (e) {
        toast.error(e.response.data.error);
      }
    }
    deleteTodos(id);
  }

  function handleClearComplete() {
    async function clearAllCompletedTask() {
      try {
        const res = await axios.delete(`${BASE_URL}/todos-clear-completed`);
        if (res.status === 200) {
          toast.success("Clear Completed Task");
          fetchAllTodos();
        }
      } catch (e) {
        toast.error(e.response.data.error);
      }
    }
    clearAllCompletedTask();
  }

  function handleFilterChange(filter) {
    setActiveFilter(filter);
  }

  return (
    <>
      <button className="dark-mode-toggle" id="dark-mode-toggle">
        <i className="fas fa-moon"></i>
      </button>
      <ToastContainer></ToastContainer>

      <div className="container">
        <header>
          <h1>Todo App</h1>

          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                id="todo-input"
                placeholder="Add a new task..."
              />
              <button id="add-btn" type="submit">
                <i className="fas fa-plus"></i> Add
              </button>
            </div>

            <div className="todo-options">
              <div className="option-group">
                <span className="option-label">Due Date:</span>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  id="due-date"
                />
              </div>

              <div className="option-group">
                <span className="option-label">Priority:</span>
                <div className="priority-selector">
                  <button
                    className={`priority-btn priority-low ${
                      formData.Priority === "LOW" ? "active" : ""
                    }`}
                    data-priority="low"
                    title="Low"
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, Priority: "LOW" })
                    }
                  ></button>
                  <button
                    type="button"
                    className={`priority-btn priority-medium ${
                      formData.Priority === "MEDIUM" ? "active" : ""
                    }`}
                    data-priority="medium"
                    title="Medium"
                    onClick={() =>
                      setFormData({ ...formData, Priority: "MEDIUM" })
                    }
                  ></button>
                  <button
                    type="button"
                    className={`priority-btn priority-high ${
                      formData.Priority === "HIGH" ? "active" : ""
                    }`}
                    data-priority="high"
                    title="High"
                    onClick={() =>
                      setFormData({ ...formData, Priority: "HIGH" })
                    }
                  ></button>
                </div>
              </div>

              <div className="option-group tag-input-container">
                <span className="option-label">Tags:</span>
                <input
                  type="text"
                  name="Tags"
                  id="tag-input"
                  value={formData.Tags}
                  onChange={handleChange}
                  placeholder="Add tag..."
                />
                <div className="tag-list" id="tag-list"></div>
              </div>
            </div>
          </form>
        </header>

        <div className="filters">
          <button 
            className={`filter-btn ${activeFilter === "all" ? "active" : ""}`} 
            onClick={() => handleFilterChange("all")}
          >
            All
          </button>
          <button 
            className={`filter-btn ${activeFilter === "active" ? "active" : ""}`} 
            onClick={() => handleFilterChange("active")}
          >
            Active
          </button>
          <button 
            className={`filter-btn ${activeFilter === "completed" ? "active" : ""}`} 
            onClick={() => handleFilterChange("completed")}
          >
            Completed
          </button>
          <button 
            className={`filter-btn ${activeFilter === "today" ? "active" : ""}`} 
            onClick={() => handleFilterChange("today")}
          >
            Due Today
          </button>
          <button 
            className={`filter-btn ${activeFilter === "upcoming" ? "active" : ""}`} 
            onClick={() => handleFilterChange("upcoming")}
          >
            Upcoming
          </button>
        </div>

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}

        <ul id="todo-list">
          {filteredTodos.map((todo) => {
            return (
              <li
                className={`todo-item priority-border-${
                  PRIORITY[todo.Priority]
                }`}
                data-id={todo.id}
                draggable="true"
                key={todo.id}
              >
                <input
                  type="checkbox"
                  value={todo.id}
                  onChange={handleChecked}
                  checked={todo.status === "COMPLETED"}
                  className="todo-checkbox"
                />
                <div className="todo-content">
                  <span className={`todo-text ${STATUS[todo.status]}`}>
                    {todo.title}
                  </span>
                  <div className="todo-meta">
                    <div
                      className={`todo-priority priority-${
                        PRIORITY[todo.Priority]
                      }`}
                      data-tooltip-id="priority-tooltip"
                      data-tooltip-content={`${
                        PRIORITY[todo.Priority]
                      } priority`}
                    ></div>

                    <Tooltip id="priority-tooltip" place="top" effect="solid" />
                    <div className="todo-due-date">
                      <i className="far fa-calendar-alt"></i>
                      <span>{formatDate(todo.dueDate)}</span>
                    </div>
                    <div className="todo-due-date">
                      <i className="fa-solid fa-table-cells-large"></i>
                      <span>{todo.Tags}</span>
                    </div>
                  </div>
                </div>
                <div className="todo-actions">
                  <button
                    className="action-btn"
                    onClick={() => handleTaskDelete(todo.id)}
                  >
                    <i className="far fa-trash-alt"></i>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="stats">
          <span id="remaining-count">{remainingTask}</span> tasks left
          <button id="clear-completed" onClick={() => handleClearComplete()}>
            Clear Completed
          </button>
        </div>
      </div>
    </>
  );
};

export default App;