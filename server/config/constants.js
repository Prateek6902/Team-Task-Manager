module.exports = {
  ROLES: {
    ADMIN: 'admin',
    MEMBER: 'member'
  },
  
  TASK_STATUS: {
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    REVIEW: 'review',
    DONE: 'done'
  },
  
  TASK_PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },
  
  PROJECT_STATUS: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    ARCHIVED: 'archived'
  },
  
  JWT_EXPIRE: '30d',
  JWT_COOKIE_EXPIRE: 30,
  
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50
  }
};