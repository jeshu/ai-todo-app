// MCP-like service for managing todos
const Todo = require('../models/Todo');

const MCPService = {
  // List todos with filtering and sorting
  async listTodos(filters = {}, sort = { createdAt: -1 }) {
    const query = {};
    
    // Apply filters
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.completed !== undefined) {
      query.completed = filters.completed;
    }
    if (filters.dueDate) {
      query.dueDate = { $gte: new Date(filters.dueDate) };
    }

    const todos = await Todo.find(query)
      .sort(sort)
      .lean();

    return todos;
  },

  // Create a new todo
  async createTodo(input) {
    try {
      // Create todo object
      const todo = new Todo({
        title: input.title,
        description: input.description || '',
        dueDate: input.dueDate ? new Date(input.dueDate) : new Date(),
        priority: input.priority || 'medium',
        completed: false
      });

      // Save the todo to database
      const savedTodo = await todo.save();

      return savedTodo;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  },

  // Get AI suggestions for todos
  async suggestTodos(context) {
    try {
      // Generate relevant TODO items based on the context
      const task = context || 'general task';
      const suggestions = [
        {
          title: `Start ${task.replace(/\s+/g, '-')}`,
          description: `Begin working on ${task}. This is the initial phase of the project/task.`,
          priority: 'high',
          timeNeeded: '2 hours',
          dueDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          title: `Research ${task}`,
          description: `Conduct thorough research about ${task} to understand requirements and best practices.`,
          priority: 'medium',
          timeNeeded: '3 hours',
          dueDate: new Date(new Date().getTime() + 48 * 60 * 60 * 1000).toISOString()
        },
        {
          title: `Plan ${task} Implementation`,
          description: `Create a detailed implementation plan for ${task} with clear milestones and deliverables.`,
          priority: 'high',
          timeNeeded: '4 hours',
          dueDate: new Date(new Date().getTime() + 72 * 60 * 60 * 1000).toISOString()
        },
        {
          title: `Review ${task} Requirements`,
          description: `Review and finalize requirements for ${task} with stakeholders.`,
          priority: 'medium',
          timeNeeded: '2 hours',
          dueDate: new Date(new Date().getTime() + 96 * 60 * 60 * 1000).toISOString()
        }];

      return suggestions;
    } catch (error) {
      console.error('Error suggesting todos:', error);
      throw error;
    }
  },

  // Analyze todo list
  async analyzeTodos(todos) {
    try {
      // Calculate basic statistics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

      const analysis = {
        summary: "Todo list analysis",
        workload: {
          total: todos.length,
          completed: todos.filter(t => t.completed).length,
          pending: todos.filter(t => !t.completed).length
        },
        priorities: {
          low: todos.filter(t => t.priority === 'low').length,
          medium: todos.filter(t => t.priority === 'medium').length,
          high: todos.filter(t => t.priority === 'high').length
        },
        deadlines: {
          today: todos.filter(t => new Date(t.dueDate).setHours(0,0,0,0) === today.setHours(0,0,0,0)),
          this_week: todos.filter(t => new Date(t.dueDate) <= thisWeek),
          future: todos.filter(t => new Date(t.dueDate) > thisWeek)
        },
        suggestions: [
          `You have ${todos.length} total todos, with ${todos.filter(t => t.priority === 'high').length} high priority items.`,
          `There are ${todos.filter(t => new Date(t.dueDate) <= now).length} todos due today.`
        ],
        conflicts: []
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing todos:', error);
      return {
        summary: "Unable to analyze todos at this time",
        workload: { total: 0, completed: 0, pending: 0 },
        priorities: { low: 0, medium: 0, high: 0 },
        deadlines: { today: [], this_week: [], future: [] },
        suggestions: [],
        conflicts: []
      };
    }
  },

  // Schedule todos
  async scheduleTodos(todos, context) {
    try {
      // Sort todos by priority and due date
      const sortedTodos = [...todos].sort((a, b) => {
        const priorityOrder = { low: 3, medium: 2, high: 1 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });

      // Update todos in database with new order
      for (const todo of sortedTodos) {
        await Todo.findByIdAndUpdate(todo._id, {
          order: sortedTodos.indexOf(todo)
        });
      }

      return sortedTodos;
    } catch (error) {
      console.error('Error scheduling todos:', error);
      return todos;
    }
  }
};

module.exports = MCPService;
