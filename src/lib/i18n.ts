export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
];

export interface Translations {
  // Common
  loading: string;
  error: string;
  success: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  search: string;
  filter: string;
  send: string;
  sending: string;
  uploading: string;
  edited: string;
  joined: string;
  
  // Main page
  title: string;
  subtitle: string;
  welcome: string;
  welcomeDescription: string;
  systemStatus: string;
  online: string;
  performance: string;
  activeTasks: string;
  teamMembers: string;
  achievements: string;
  problems: string;
  achievements_page: string;
  lastUpdate: string;
  aiAssistant: string;
  
  // Notifications
  notifications: string;
  noNotifications: string;
  markAsRead: string;
  markAllAsRead: string;
  
  // Auth
  login: string;
  logout: string;
  signup: string;
  signupPrompt: string;
  email: string;
  password: string;
  forgotPassword: string;
  resetPassword: string;
  confirmPassword: string;
  fullName: string;
  position: string;
  department: string;
  loginError: string;
  signupError: string;
  resetPasswordError: string;
  resetPasswordSuccess: string;
  authRedirect: string;
  invalidCredentials: string;
  passwordMismatch: string;
  weakPassword: string;
  userExists: string;
  
  // Navigation
  dashboard: string;
  missionControl: string;
  tasks: string;
  team: string;
  projects: string;
  analytics: string;
  issues: string;
  awards: string;
  admin: string;
  
  // UAV-specific navigation
  operations: string;
  production: string;
  maintenance: string;
  documents: string;
  integrations: string;
  
  // Dashboard
  operationalCenter: string;
  uavSystem: string;
  welcomeUser: string;
  systems: string;
  ready: string;
  launchMission: string;
  
  // Tasks
  allTasks: string;
  myTasks: string;
  searchTasks: string;
  createTask: string;
  taskTitle: string;
  taskDescription: string;
  priority: string;
  dueDate: string;
  assignee: string;
  status: string;
  
  // Form elements
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: string;
  location: string;
  
  // UAV Dashboard specific
  strategicGoal: string;
  increaseCapacity: string;
  productionUnit: string;
  quality: string;
  deadline: string;
  activeMissionsLabel: string;
  productionConveyor: string;
  unitsInProduction: string;
  systemStatusLabel: string;
  onTrackStatus: string;
  armedStatus: string;
  readyStatus: string;
  infoStatus: string;
  warningStatus: string;
  okStatus: string;
  attentionStatus: string;
  dronesInFlight: string;
  systemHealth: string;
  operatorsOnline: string;
  lastUpdateTime: string;
  
  // Status labels
  high: string;
  medium: string;
  low: string;
  
  // Departments
  depEngineering: string;
  depDesign: string;
  depMarketing: string;
  depSales: string;
  depSupport: string;
  depHR: string;
  depFinance: string;
  depProduction: string;
  
  // Team
  addTeamMember: string;
  editTeamMember: string;
  deleteTeamMember: string;
  viewProfile: string;
  role: string;
  employee: string;
  teamLead: string;
  manager: string;
  
  // Common labels
  tryAgainLabel: string;
  noTeamMembersLabel: string;
  sinceLabel: string;
  editLabel: string;
  roleLabel: string;
  cancelLabel: string;
  saveLabel: string;
  
  // AI Assistant
  aiAssistantDesc: string;
  aiErrorTitle: string;
  aiErrorDesc: string;
  aiAssistantReadyTitle: string;
  aiAssistantReadyDesc: string;
  aiMessageRequired: string;
  aiEmployeeRequired: string;
  aiProcessing: string;
  aiRequest: string;
  aiModeLabel: string;
  aiModePlaceholder: string;
  aiEmployeePlaceholder: string;
  aiTaskDescriptionLabel: string;
  aiMessageLabel: string;
  aiPlaceholderCreateTask: string;
  aiPlaceholderSuggestOptimization: string;
  aiPlaceholderChat: string;
  aiResponseTitle: string;
  aiBadgeTask: string;
  aiBadgeAnalysis: string;
  aiBadgeOptimization: string;
  aiBadgeChat: string;
  aiTaskName: string;
  aiDescription: string;
  aiPriority: string;
  aiTime: string;
  aiTags: string;
  aiRecommendations: string;
  aiWorkloadStatus: string;
  aiAnalysis: string;
  aiOptimizations: string;
  aiSkillDevelopment: string;
  aiAnswer: string;
  taskCreatedTitle: string;
  taskAssigned: string;
  taskCreationError: string;
  aiModeCreateTask: string;
  aiModeAnalyzeWorkload: string;
  aiModeSuggestOptimization: string;
  aiModeChat: string;
  hours: string;
  
  // Forms
  formAssignParticipant: string;
  formSelectEmployee: string;
  formNoAvailableEmployees: string;
  formAssign: string;
  formCreateIssue: string;
  formReportNewProblem: string;
  formProblemTitle: string;
  formProblemTitlePlaceholder: string;
  formDetailedDescription: string;
  formDetailedDescriptionPlaceholder: string;
  formSeverity: string;
  formSelectSeverity: string;
  critical: string;
  formCreating: string;
  formCreateProblem: string;
  formCreateNewProject: string;
  formCreateNewTask: string;
  formSelectPriority: string;
  formSelectAssignee: string;
  formEnterTags: string;
  formTagsDescription: string;
  
  // Additional missing keys
  formAddNewCompany: string;
  formProjectName: string;
  formProjectNamePlaceholder: string;
  formIndustry: string;
  formIndustryPlaceholder: string;
  formCreatingNewTask: string;
  formFillTaskInfo: string;
  formTaskTitle: string;
  formTaskTitlePlaceholder: string;
  formTaskDescription: string;
  formTaskDescriptionPlaceholder: string;
  invitationAccepted: string;
  invitationDeclined: string;
  onlineUsersTitle: string;
  activeUsersInSystem: string;
  noActiveUsers: string;
  moreUsersOnlinePrefix: string;
  moreUsersOnlineSuffix: string;
  smartAISidebar: string;
  selectTaskToSeeInsights: string;
  taskSummary: string;
  completed: string;
  inProgress: string;
  riskAnalysis: string;
  riskCritical: string;
  recommendedActions: string;
  taskIntelligence: string;
  complexity: string;
  timeEstimation: string;
  noTaskSelected: string;
  aiActions: string;
  generateSummary: string;
  suggestSubtasks: string;
  findExperts: string;
  strategicLoadingTitle: string;
  strategicLoadingDesc: string;
  strategicFocusTitle: string;
  strategicNotFound: string;
  targetDate: string;
  strategicBudgetPlanned: string;
  strategicStatus: string;
  statusPlanned: string;
  statusActive: string;
  statusDone: string;
  statusOnHold: string;
  strategicProgress: string;
  strategicTarget: string;
  strategicCurrent: string;
  unsupportedFileType: string;
  fileTooLarge: string;
  uploadFailed: string;
  userNotFound: string;
  filesUploaded: string;
  downloadFailed: string;
  fileDeleted: string;
  deleteFailed: string;
  attachments: string;
  addFile: string;
  fileAttached: string;
  participants: string;
  sendMessage: string;
  messageNotSent: string;
  failedToLoadChat: string;
  todayLabel: string;
  yesterdayLabel: string;
  typing: string;
  taskCompleted: string;
  taskStarted: string;
  taskStatusChanged: string;
  commentAdded: string;
  participantAdded: string;
  todayDate: string;
  systemMessage: string;
  
  // Additional missing keys for components
  comments: string;
  writeComment: string;
  commentFailed: string;
  noComments: string;
  unknownUser: string;
  pressCtrlEnter: string;
  pending: string;
  cancelled: string;
  onHold: string;
  estimated: string;
  actual: string;
  created: string;
  participantRemoved: string;
  removeParticipantFailed: string;
  inviteParticipant: string;
  inviteToChat: string;
  addParticipantFailed: string;
  addParticipant: string;
  noParticipants: string;
}

export const translations: Record<string, Translations> = {
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    send: 'Send',
    sending: 'Sending...',
    uploading: 'Uploading...',
    edited: 'edited',
    joined: 'joined',
    
    // Main page
    title: 'TIGER CRM',
    subtitle: 'Task & Project Management System',
    welcome: 'Welcome',
    welcomeDescription: 'Your comprehensive task and project management system',
    systemStatus: 'System Status',
    online: 'Online',
    performance: 'Performance',
    activeTasks: 'Active Tasks',
    teamMembers: 'Team Members',
    achievements: 'Achievements',
    problems: 'Problems',
    achievements_page: 'Awards',
    lastUpdate: 'Last Update',
    aiAssistant: 'AI Assistant',
    
    // Notifications
    notifications: 'Notifications',
    noNotifications: 'No notifications',
    markAsRead: 'Mark as read',
    markAllAsRead: 'Mark all as read',
    
    // Auth
    login: 'Login',
    logout: 'Logout',
    signup: 'Sign Up',
    signupPrompt: 'Don\'t have an account? Sign up',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    position: 'Position',
    department: 'Department',
    loginError: 'Login failed',
    signupError: 'Registration failed',
    resetPasswordError: 'Password reset failed',
    resetPasswordSuccess: 'Password reset email sent',
    authRedirect: 'Redirecting...',
    invalidCredentials: 'Invalid email or password',
    passwordMismatch: 'Passwords do not match',
    weakPassword: 'Password too weak',
    userExists: 'User already exists',
    
    // Navigation
    dashboard: 'Dashboard',
    missionControl: 'Mission Control',
    tasks: 'Tasks',
    team: 'Team',
    projects: 'Projects',
    analytics: 'Analytics',
    issues: 'Issues',
    awards: 'Awards',
    admin: 'Admin',
    
    // UAV-specific navigation
    operations: 'Operations',
    production: 'Production',
    maintenance: 'Maintenance',
    documents: 'Documents',
    integrations: 'Integrations',
    
    // Dashboard
    operationalCenter: 'Operational Center',
    uavSystem: 'UAV Management System',
    welcomeUser: 'Welcome',
    systems: 'Systems',
    ready: 'READY',
    launchMission: 'Launch Mission',
    
    // Tasks
    allTasks: 'All Tasks',
    myTasks: 'My Tasks',
    searchTasks: 'Search tasks...',
    createTask: 'Create Task',
    taskTitle: 'Task Title',
    taskDescription: 'Description',
    priority: 'Priority',
    dueDate: 'Due Date',
    assignee: 'Assignee',
    status: 'Status',
    
    // Form elements
    name: 'Name',
    description: 'Description',
    startDate: 'Start Date',
    endDate: 'End Date',
    budget: 'Budget',
    location: 'Location',
    
    // UAV Dashboard specific
    strategicGoal: 'Strategic Goal',
    increaseCapacity: 'Increase production capacity to 100 units/month',
    productionUnit: 'Production',
    quality: 'Quality',
    deadline: 'Deadline',
    activeMissionsLabel: 'Active Missions',
    productionConveyor: 'Production Line',
    unitsInProduction: 'Units in production',
    systemStatusLabel: 'System Status',
    onTrackStatus: 'ON TRACK',
    armedStatus: 'ARMED',
    readyStatus: 'READY',
    infoStatus: 'INFO',
    warningStatus: 'WARNING',
    okStatus: 'OK',
    attentionStatus: 'ATTENTION',
    dronesInFlight: 'Drones in flight',
    systemHealth: 'System health',
    operatorsOnline: 'Operators online',
    lastUpdateTime: 'Last update',
    
    // Status labels
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    
    // Departments
    depEngineering: 'Engineering',
    depDesign: 'Design',
    depMarketing: 'Marketing',
    depSales: 'Sales',
    depSupport: 'Support',
    depHR: 'HR',
    depFinance: 'Finance',
    depProduction: 'Production',
    
    // Team
    addTeamMember: 'Add Team Member',
    editTeamMember: 'Edit Team Member',
    deleteTeamMember: 'Delete Team Member',
    viewProfile: 'View Profile',
    role: 'Role',
    employee: 'Employee',
    teamLead: 'Team Lead',
    manager: 'Manager',
    
    // Common labels
    tryAgainLabel: 'Try again',
    noTeamMembersLabel: 'No team members found',
    sinceLabel: 'since',
    editLabel: 'Edit',
    roleLabel: 'Role',
    cancelLabel: 'Cancel',
    saveLabel: 'Save',
    
    // AI Assistant
    aiAssistantDesc: 'AI-powered task management assistant',
    aiErrorTitle: 'AI Error',
    aiErrorDesc: 'Failed to get response from AI',
    aiAssistantReadyTitle: 'AI Analysis Ready',
    aiAssistantReadyDesc: 'Tiger AI has responded with insights',
    aiMessageRequired: 'Message is required',
    aiEmployeeRequired: 'Employee selection is required',
    aiProcessing: 'AI processing...',
    aiRequest: 'Ask Tiger AI',
    aiModeLabel: 'AI Assistant Mode',
    aiModePlaceholder: 'Select mode',
    aiEmployeePlaceholder: 'Select an employee',
    aiTaskDescriptionLabel: 'Task description',
    aiMessageLabel: 'Message for AI',
    aiPlaceholderCreateTask: 'Describe the task in free form. AI will create a personalized task...',
    aiPlaceholderSuggestOptimization: 'Describe a problem or area to optimize...',
    aiPlaceholderChat: 'Ask any question about task management...',
    aiResponseTitle: 'Tiger AI Response',
    aiBadgeTask: 'Task',
    aiBadgeAnalysis: 'Analysis',
    aiBadgeOptimization: 'Optimization',
    aiBadgeChat: 'Chat',
    aiTaskName: 'Task name:',
    aiDescription: 'Description:',
    aiPriority: 'Priority',
    aiTime: 'Time',
    aiTags: 'Tags:',
    aiRecommendations: 'Recommendations',
    aiWorkloadStatus: 'Workload Status',
    aiAnalysis: 'Analysis',
    aiOptimizations: 'Optimizations',
    aiSkillDevelopment: 'Skill Development',
    aiAnswer: 'Answer',
    taskCreatedTitle: 'Task Created',
    taskAssigned: 'Task assigned to',
    taskCreationError: 'Failed to create task',
    aiModeCreateTask: 'Create Task',
    aiModeAnalyzeWorkload: 'Analyze Workload',
    aiModeSuggestOptimization: 'Suggest Optimization',
    aiModeChat: 'Chat',
    hours: 'hours',
    
    // Forms
    formAssignParticipant: 'Assign Participant',
    formSelectEmployee: 'Select Employee',
    formNoAvailableEmployees: 'No available employees',
    formAssign: 'Assign',
    formCreateIssue: 'Create Issue',
    formReportNewProblem: 'Report New Problem',
    formProblemTitle: 'Problem Title',
    formProblemTitlePlaceholder: 'Enter problem title',
    formDetailedDescription: 'Detailed Description',
    formDetailedDescriptionPlaceholder: 'Describe the problem in detail',
    formSeverity: 'Severity',
    formSelectSeverity: 'Select severity',
    critical: 'Critical',
    formCreating: 'Creating...',
    formCreateProblem: 'Create Problem',
    formCreateNewProject: 'Create New Project',
    formCreateNewTask: 'Create New Task',
    formSelectPriority: 'Select priority',
    formSelectAssignee: 'Select assignee',
    formEnterTags: 'Enter tags',
    formTagsDescription: 'Enter tags separated by commas',
    
    // Additional missing keys
    formAddNewCompany: 'Add New Company',
    formProjectName: 'Project Name',
    formProjectNamePlaceholder: 'Enter project name',
    formIndustry: 'Industry',
    formIndustryPlaceholder: 'Enter industry',
    formCreatingNewTask: 'Create New Task',
    formFillTaskInfo: 'Fill in task information',
    formTaskTitle: 'Task Title',
    formTaskTitlePlaceholder: 'Enter task title',
    formTaskDescription: 'Task Description',
    formTaskDescriptionPlaceholder: 'Enter task description',
    invitationAccepted: 'Invitation Accepted',
    invitationDeclined: 'Invitation Declined',
    onlineUsersTitle: 'Online Users',
    activeUsersInSystem: 'active users in system',
    noActiveUsers: 'No active users',
    moreUsersOnlinePrefix: 'and',
    moreUsersOnlineSuffix: 'more users online',
    smartAISidebar: 'Smart AI Sidebar',
    selectTaskToSeeInsights: 'Select a task to see AI insights',
    taskSummary: 'Task Summary',
    completed: 'Completed',
    inProgress: 'In Progress',
    riskAnalysis: 'Risk Analysis',
    riskCritical: 'Critical Risk',
    recommendedActions: 'Recommended Actions',
    taskIntelligence: 'Task Intelligence',
    complexity: 'Complexity',
    timeEstimation: 'Time Estimation',
    noTaskSelected: 'No task selected',
    aiActions: 'AI Actions',
    generateSummary: 'Generate Summary',
    suggestSubtasks: 'Suggest Subtasks',
    findExperts: 'Find Experts',
    strategicLoadingTitle: 'Loading Strategic Data',
    strategicLoadingDesc: 'Please wait...',
    strategicFocusTitle: 'Strategic Focus',
    strategicNotFound: 'Strategic objective not found',
    targetDate: 'Target Date',
    strategicBudgetPlanned: 'Budget Planned',
    strategicStatus: 'Status',
    statusPlanned: 'Planned',
    statusActive: 'Active',
    statusDone: 'Done',
    statusOnHold: 'On Hold',
    strategicProgress: 'Progress',
    strategicTarget: 'Target',
    strategicCurrent: 'Current',
    unsupportedFileType: 'Unsupported file type',
    fileTooLarge: 'File too large',
    uploadFailed: 'Upload failed',
    userNotFound: 'User not found',
    filesUploaded: 'Files uploaded',
    downloadFailed: 'Download failed',
    fileDeleted: 'File deleted',
    deleteFailed: 'Delete failed',
    attachments: 'Attachments',
    addFile: 'Add File',
    fileAttached: 'File attached',
    participants: 'Participants',
    sendMessage: 'Send Message',
    messageNotSent: 'Message not sent',
    failedToLoadChat: 'Failed to load chat',
    todayLabel: 'Today',
    yesterdayLabel: 'Yesterday',
    typing: 'typing...',
    taskCompleted: 'Task completed',
    taskStarted: 'Task started',
    taskStatusChanged: 'Task status changed',
    commentAdded: 'Comment added',
    participantAdded: 'Participant added',
    todayDate: 'Today',
    systemMessage: 'System Message',
  },
  
  // Use English as fallback for now to prevent build errors
  ru: {
    // Common
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    create: 'Создать',
    search: 'Поиск',
    filter: 'Фильтр',
    send: 'Отправить',
    sending: 'Отправка...',
    uploading: 'Загрузка...',
    edited: 'изменено',
    joined: 'присоединился',
    
    // Main page
    title: 'ТИГР CRM',
    subtitle: 'Система управления задачами и проектами',
    welcome: 'Добро пожаловать',
    welcomeDescription: 'Ваша комплексная система управления задачами и проектами',
    systemStatus: 'Статус системы',
    online: 'Онлайн',
    performance: 'Производительность',
    activeTasks: 'Активные задачи',
    teamMembers: 'Участники команды',
    achievements: 'Достижения',
    problems: 'Проблемы',
    achievements_page: 'Награды',
    lastUpdate: 'Последнее обновление',
    aiAssistant: 'ИИ Ассистент',
    
    // Add missing keys with English fallbacks
    notifications: 'Уведомления',
    noNotifications: 'Нет уведомлений',
    markAsRead: 'Отметить как прочитанное',
    markAllAsRead: 'Отметить все как прочитанные',
    login: 'Войти',
    logout: 'Выйти',
    email: 'Email',
    password: 'Пароль',
    dashboard: 'Панель управления',
    operationalCenter: 'Операционный центр',
    uavSystem: 'Система управления БПЛА',
    missionControl: 'Центр управления',
    tasks: 'Задачи',
    team: 'Команда',
    projects: 'Проекты',
    analytics: 'Аналитика',
    issues: 'Проблемы',
    admin: 'Админ',
    operations: 'Операции',
    production: 'Производство',
    maintenance: 'Техобслуживание',
    documents: 'Документооборот',
    integrations: 'Интеграции',
    strategicGoal: 'Стратегическая цель',
    activeMissionsLabel: 'Активные миссии',
    productionConveyor: 'Производственный конвейер',
    systemStatusLabel: 'Системный статус',
    onTrackStatus: 'НА ПУТИ',
    armedStatus: 'ВООРУЖЕН',
    readyStatus: 'ГОТОВ',
    infoStatus: 'ИНФО',
    warningStatus: 'ПРЕДУПРЕЖДЕНИЕ',
    okStatus: 'ОК',
    attentionStatus: 'ВНИМАНИЕ',
    
    // Use English for remaining keys to prevent build errors
    signup: 'Sign Up',
    signupPrompt: 'Don\'t have an account? Sign up',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    position: 'Position',
    department: 'Department',
    comments: 'Comments',
    writeComment: 'Write Comment',
    pending: 'Pending',
    cancelled: 'Cancelled',
    onHold: 'On Hold',
  },
  
  bg: {
    ...translations.en,
    // Bulgarian-specific overrides
    title: 'TIGER CRM',
    welcome: 'Добре дошли',
    systemStatus: 'Състояние на системата',
    online: 'Онлайн',
    activeTasks: 'Активни задачи',
    teamMembers: 'Членове на екипа',
    achievements: 'Постижения',
    problems: 'Проблеми',
    lastUpdate: 'Последна актуализация',
    operationalCenter: 'Операционен център',
    tasks: 'Задачи',
    team: 'Екип',
    projects: 'Проекти',
    analytics: 'Аналитика',
    issues: 'Проблеми',
    admin: 'Админ',
  }
};

export type { Translations };