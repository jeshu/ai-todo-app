# AI-Powered Todo Application

A modern todo application with AI integration built using React, Node.js, Express, MongoDB, and Docker.

## Features

- Create, read, update, and delete todos
- AI-powered todo suggestions
- Priority-based todo organization
- Due date tracking
- Completed task management
- Docker-based deployment

## Tech Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **AI Integration**: Ollama for AI suggestions
- **Containerization**: Docker and Docker Compose

## Project Structure

```
.
├── client/                 # Frontend React application
├── services/              # Backend services
│   └── mcpService.js     # Main service for todo operations
├── models/               # Database models
│   └── Todo.js          # Todo model definition
├── server.js             # Main Express server
├── docker-compose.yml    # Docker configuration
├── Dockerfile           # Backend Docker configuration
└── package.json         # Project dependencies
```

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- MongoDB
- Ollama (for AI suggestions)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jeshu/ai-todo-app.git
cd ai-todo-app
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
MONGODB_URI=mongodb://localhost:27017/mcp-todo-app
PORT=5001
```

4. Start the application:
```bash
docker-compose up -d
```

## Running the Application

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id/toggle` - Toggle todo completion
- `DELETE /api/todos/:id` - Delete a todo
- `POST /api/ai/suggestions` - Get AI suggestions
- `POST /api/ai/analyze` - Analyze todo list
- `POST /api/ai/schedule` - Schedule todos

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
