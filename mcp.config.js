const mcp = require('@ai-sdk/mcp');
const Todo = require('./models/Todo');
const { Client } = require('@ollama/ollama');

// Initialize Ollama
const ollama = new Client({
  baseUrl: 'http://ollama:11434'
});

// Define the MCP tool for managing todos
const todoTool = {
  name: 'todo_manager',
  description: 'Manage TODO items with local AI capabilities using Ollama',
  methods: {
    // List todos with filtering and sorting capabilities
    listTodos: async (filters = {}, sort = { createdAt: -1 }) => {
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

    // Create a new todo with AI suggestions
    createTodo: async (input) => {
      const todo = new Todo({
        title: input.title,
        description: input.description || '',
        dueDate: input.dueDate ? new Date(input.dueDate) : new Date(),
        priority: input.priority || 'medium',
        completed: false
      });

      // Get AI suggestions for priority
      if (!input.priority) {
        const prompt = `
          Analyze this todo item and suggest an appropriate priority level (low/medium/high):
          Title: ${todo.title}
          Description: ${todo.description}
          Due Date: ${todo.dueDate.toISOString()}
          
          Suggest priority: `;

        const response = await ollama.chat({
          model: 'llama2',
          messages: [{ role: 'user', content: prompt }]
        });

        const suggestedPriority = response.choices[0].message.content.trim().toLowerCase();
        if (['low', 'medium', 'high'].includes(suggestedPriority)) {
          todo.priority = suggestedPriority;
        }
      }

      const savedTodo = await todo.save();
      return savedTodo;
    },

    // Get AI suggestions for todos
    suggestTodos: async (context) => {
      const prompt = `
        Generate relevant TODO items based on this context:
        ${JSON.stringify(context)}
        
        Generate 3 todo items with:
        - Title
        - Description
        - Priority (low/medium/high)
        - Due Date
        
        Format the response as JSON array: `;

      const response = await ollama.chat({
        model: 'llama2',
        messages: [{ role: 'user', content: prompt }]
      });

      try {
        const suggestions = JSON.parse(response.choices[0].message.content.trim());
        return suggestions;
      } catch (error) {
        console.error('Error parsing AI suggestions:', error);
        return [];
      }
    },

    // Analyze todo list
    analyzeTodos: async (todos) => {
      const prompt = `
        Analyze this todo list and provide insights:
        ${JSON.stringify(todos)}
        
        Provide:
        - Summary of tasks
        - Priority distribution
        - Time management suggestions
        
        Format as JSON: `;

      const response = await ollama.chat({
        model: 'llama2',
        messages: [{ role: 'user', content: prompt }]
      });

      try {
        return JSON.parse(response.choices[0].message.content.trim());
      } catch (error) {
        console.error('Error parsing analysis:', error);
        return { summary: "Unable to analyze todos at this time" };
      }
    },

    // Schedule todos
    scheduleTodos: async (todos, context) => {
      const prompt = `
        Schedule these todos based on their priorities and context:
        Todos: ${JSON.stringify(todos)}
        Context: ${JSON.stringify(context)}
        
        Consider:
        - Priority levels
        - Due dates
        - Contextual factors
        
        Return scheduled todos with updated due dates and priorities.
        Format as JSON array: `;

      const response = await ollama.chat({
        model: 'llama2',
        messages: [{ role: 'user', content: prompt }]
      });

      try {
        const scheduledTodos = JSON.parse(response.choices[0].message.content.trim());
        
        // Update todos in database
        for (const todo of scheduledTodos) {
          await Todo.findByIdAndUpdate(todo._id, {
            dueDate: todo.dueDate,
            priority: todo.priority
          });
        }

        return scheduledTodos;
      } catch (error) {
        console.error('Error scheduling todos:', error);
        return todos;
      }
    }
  }
};

// Register the MCP tool
mcp.registerTool(todoTool);

// Export the MCP server
module.exports = mcp;
