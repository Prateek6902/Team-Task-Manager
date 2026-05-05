
# 🚀 TaskFlow Pro - Team Task Manager

A full-stack MERN (MongoDB, Express, React, Node.js) application for efficient team task management with role-based access control, real-time analytics dashboards, and seamless project tracking.

![TaskFlow Pro](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-18.x-brightgreen)
![React](https://img.shields.io/badge/react-18.x-61DAFB)

## 🌐 Live Demo

🔗 **Live Application:** [https://team-task-manager-gtdo.onrender.com](https://team-task-manager-gtdo.onrender.com)

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** - Secure login and registration system
- **Role-Based Access Control** - Two distinct roles with different permissions:
  - **Admin:** Full system access, user management, all CRUD operations
  - **Member:** Task management, project viewing, profile management
- **Password Encryption** - bcryptjs hashing for secure password storage
- **Session Management** - Token-based sessions with configurable expiration

### 📊 Interactive Dashboard
- **Real-time Statistics** - Total projects, tasks, completion rates
- **Visual Analytics** - Interactive charts using Recharts
  - Weekly task activity trends
  - Task distribution by status (To Do, In Progress, Review, Done)
  - Priority breakdown charts
- **Recent Activity** - Quick overview of latest tasks
- **Productivity Metrics** - Completion percentages and overdue tracking

### 📁 Project Management
- **Create & Manage Projects** - Full CRUD operations
- **Progress Tracking** - Automatic progress calculation based on task statuses:
  - Done = 100%, Review = 75%, In Progress = 50%, To Do = 0%
- **Task Counts** - Real-time breakdown of task statuses
- **Tags & Categories** - Organize projects with custom tags
- **Member Management** - Add/remove team members to projects
- **Search & Filter** - Find projects by name, status, or tags
- **Sorting Options** - Sort by date, progress, or name

### ✅ Task Management
- **Kanban-Style View** - Drag tasks between status columns
- **List View** - Traditional task list with quick actions
- **Task Details** - Title, description, priority levels, due dates
- **Status Workflow** - To Do → In Progress → Review → Done
- **Priority Levels** - Low, Medium, High, Urgent
- **Assignment** - Assign tasks to team members
- **Search & Filter** - Find tasks by title, status, or priority
- **Due Date Tracking** - Visual indicators for overdue tasks

### 👤 User Management
- **Profile Management** - Update personal information
- **Password Change** - Secure password update functionality
- **Team Directory** - View all team members and their roles
- **Admin Panel** - Full user management for administrators
  - Create/delete users
  - Update user roles
  - Deactivate/activate accounts

### 🎨 User Interface
- **Material-UI Design** - Professional, consistent component library
- **Framer Motion Animations** - Smooth transitions and micro-interactions
- **Dark/Light Mode** - Toggle between themes with persistent settings
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Custom Styling** - Gradient backgrounds, custom scrollbars
- **Toast Notifications** - User-friendly feedback messages
- **Loading States** - Skeleton loaders and progress indicators

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| Material-UI | 5.15.0 | Component Library |
| Framer Motion | 10.16.16 | Animations |
| Recharts | 2.10.3 | Charts & Graphs |
| React Router DOM | 6.21.1 | Routing |
| Axios | 1.6.2 | HTTP Client |
| date-fns | 3.0.6 | Date Formatting |
| React Hot Toast | 2.4.1 | Notifications |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x | Runtime Environment |
| Express.js | 4.18.2 | Web Framework |
| MongoDB | 8.0.3 | Database |
| Mongoose | 8.0.3 | ODM |
| JWT | 9.0.2 | Authentication |
| bcryptjs | 2.4.3 | Password Hashing |
| dotenv | 16.3.1 | Environment Variables |
| CORS | 2.8.5 | Cross-Origin Requests |
| Helmet | 7.1.0 | Security Headers |
| Morgan | 1.10.0 | HTTP Logger |

### Deployment
- **Platform:** Render
- **Database:** MongoDB Atlas
- **CI/CD:** Automatic deployments from GitHub

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **MongoDB** (Local installation or MongoDB Atlas account)

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/Prateek6902/Team-Task-Manager.git
cd Team-Task-Manager
