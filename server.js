require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const MCPService = require('./services/mcpService');
const Todo = require('./models/Todo');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: '*', // Allow any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/mcp-todo-app';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('Connected to MongoDB successfully');
  console.log('Using MongoDB URI:', MONGODB_URI);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('MongoDB URI:', MONGODB_URI);
  console.error('Error details:', err.message);
});

// API Routes
// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    console.log('Received GET request for todos with query:', req.query);
    const { priority, completed, dueDate } = req.query;
    const filters = {};
    
    if (priority) filters.priority = priority;
    if (completed !== undefined) filters.completed = completed === 'true';
    if (dueDate) filters.dueDate = new Date(dueDate);

    console.log('Query filters:', filters);
    const todos = await MCPService.listTodos(filters);
    console.log('Found todos:', todos);
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Create new todo
app.post('/api/todos', async (req, res) => {
  try {
    console.log('Received POST request to create todo:', req.body);
    const todo = await MCPService.createTodo(req.body);
    res.json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update todo
app.put('/api/todos/:id', async (req, res) => {
  console.log('Received PUT request to update todo:', req.params.id, req.body);
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(todo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete todo
app.delete('/api/todos/:id', async (req, res) => {
  console.log('Received DELETE request for todo:', req.params.id);
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Endpoints
// Get AI suggestions
app.post('/api/ai/suggestions', async (req, res) => {
  try {
    const { context } = req.body;
    if (!context) {
      return res.status(400).json({ error: 'Task context is required' });
    }

    console.log('Received AI suggestions request:', context);
    const suggestions = await MCPService.suggestTodos(context);
    res.json(suggestions);
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    res.status(500).json({ error: 'Failed to get AI suggestions' });
  }
});

// Analyze todos
app.post('/api/ai/analyze', async (req, res) => {
  try {
    console.log('Received AI analyze request:', req.body);
    const todos = req.body.todos;
    const analysis = await MCPService.analyzeTodos(todos);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing todos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Schedule todos
app.post('/api/ai/schedule', async (req, res) => {
  try {
    console.log('Received AI schedule request:', req.body);
    const { todos, context } = req.body;
    const scheduledTodos = await MCPService.scheduleTodos(todos, context);
    res.json(scheduledTodos);
  } catch (error) {
    console.error('Error scheduling todos:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
