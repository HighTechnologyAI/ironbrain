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
  
  // UAV specific
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
  
  // Auth & Forms
  auth: string;
  signIn: string;
  signUp: string;
  registration: string;
  email: string;
  password: string;
  fullName: string;
  position: string;
  department: string;
  phone: string;
  telegram: string;
  signingIn: string;
  registering: string;
  enterSystem: string;
  successLogin: string;
  welcomeToTiger: string;
  loginError: string;
  registrationSuccess: string;
  checkEmail: string;
  registrationError: string;
  invalidCredentials: string;
  emailNotConfirmed: string;
  userExists: string;
  weakPassword: string;
  loginErrorGeneric: string;
  registrationErrorGeneric: string;
  selectDepartment: string;
  minPassword: string;
  systemDesc: string;
  
  // All missing keys with fallback to prevent build errors
  notifications: string;
  noNotifications: string;
  markAsRead: string;
  markAllAsRead: string;
  login: string;
  logout: string;
  signup: string;
  signupPrompt: string;
  forgotPassword: string;
  resetPassword: string;
  confirmPassword: string;
  signupError: string;
  resetPasswordError: string;
  resetPasswordSuccess: string;
  authRedirect: string;
  passwordMismatch: string;
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
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: string;
  location: string;
  high: string;
  medium: string;
  low: string;
  depEngineering: string;
  depDesign: string;
  depMarketing: string;
  depSales: string;
  depSupport: string;
  depHR: string;
  depFinance: string;
  depProduction: string;
  addTeamMember: string;
  editTeamMember: string;
  deleteTeamMember: string;
  viewProfile: string;
  role: string;
  employee: string;
  teamLead: string;
  manager: string;
  tryAgainLabel: string;
  noTeamMembersLabel: string;
  sinceLabel: string;
  editLabel: string;
  roleLabel: string;
  cancelLabel: string;
  saveLabel: string;
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
  tasksLoadError: string;
  teamDesc: string;
  tasksDescription: string;
  noTasksFound: string;
  aiCapabilitiesPersonalized: string;
  aiCapabilitiesWorkload: string;
  aiCapabilitiesOptimization: string;
  aiCapabilitiesChat: string;
  aiTipTitle: string;
  aiTipText: string;
  enterAdminKey: string;
  loginToAdmin: string;
  requestCompleted: string;
  recordsReceived: string;
  backupCreated: string;
  fileDownloaded: string;
  enterTaskName: string;
  taskCreatedViaAPI: string;
  checking: string;
  systemAdministration: string;
  adminModeActive: string;
  fullAccess: string;
  mainMenu: string;
  update: string;
  backup: string;
  database: string;
  totalUsers: string;
  activeProfiles: string;
  totalTasks: string;
  allTime: string;
  apiStatus: string;
  recentTasks: string;
  quickActions: string;
  optimizeDB: string;
  userManagement: string;
  exportReports: string;
  systemSettings: string;
  completedTasksLabel: string;
  activeEmployeesLabel: string;
  averageTimeLabel: string;
  achievementsLabel: string;
  analyticsTitle: string;
  performanceAnalysisDesc: string;
  exportReportLabel: string;
  periodLabel: string;
  last7DaysLabel: string;
  last30DaysLabel: string;
  last3MonthsLabel: string;
  lastYearLabel: string;
  departmentLabel: string;
  allDepartmentsLabel: string;
  forPeriodLabel: string;
  weeklyPerformanceLabel: string;
  plannedVsCompletedLabel: string;
  departmentPerformanceLabel: string;
  tasksAndEfficiencyLabel: string;
  awardsTitle: string;
  motivationSystemDesc: string;
  createAwardLabel: string;
  totalAchievementsLabel: string;
  issuesTitle: string;
  issueTrackingDesc: string;
  createIssueLabel: string;
  searchIssuesPlaceholder: string;
  statusLabel: string;
  allStatusesLabel: string;
  openStatus: string;
  inProgressStatus: string;
  resolvedStatus: string;
  closedStatus: string;
  missionControlTitle: string;
  missionControlDesc: string;
  
  // Additional missing keys for remaining errors
  missionControlCenter: string;
  incoming: string;
  mechanical: string;
  electronics: string;
  assembly: string;
  testing: string;
  packaging: string;
  urgent: string;
  normal: string;
  productionKanban: string;
  progress: string;
  assignedTo: string;
  estimatedCompletion: string;
  taskStatusUpdated: string;
  taskStatusUpdateError: string;
  tasksTitle: string;
  taskStatus: string;
  allStatuses: string;
  taskPriority: string;
  allPriorities: string;
  createdByMe: string;
  noTasksFoundDesc: string;
  noActiveTasks: string;
  noActiveTasksDesc: string;
  noCreatedTasks: string;
  noCreatedTasksDesc: string;
  away: string;
  offline: string;
  unknown: string;
  administrator: string;
  intern: string;
  teamManagementDesc: string;
  addEmployeeLabel: string;
  loadingTeamLabel: string;
  dataLoadErrorLabel: string;
  technicalStatus: string;
}

// Base English translations with all required keys
const baseTranslations: Translations = {
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
  
  // UAV specific
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
  
  // Auth & Forms
  auth: 'Authorization',
  signIn: 'Sign In',
  signUp: 'Sign Up',
  registration: 'Registration',
  email: 'Email',
  password: 'Password',
  fullName: 'Full Name',
  position: 'Position',
  department: 'Department',
  phone: 'Phone',
  telegram: 'Telegram',
  signingIn: 'Signing in...',
  registering: 'Registering...',
  enterSystem: 'Enter the system or create a new account',
  successLogin: 'Successful login',
  welcomeToTiger: 'Welcome to Tiger CRM!',
  loginError: 'Login error',
  registrationSuccess: 'Registration successful!',
  checkEmail: 'Check your email to confirm your account (or login immediately if confirmation is disabled)',
  registrationError: 'Registration error',
  invalidCredentials: 'Invalid email or password',
  emailNotConfirmed: 'Confirm your email before logging in',
  userExists: 'User with this email already exists',
  weakPassword: 'Password is too weak. Minimum 6 characters',
  loginErrorGeneric: 'An error occurred during login',
  registrationErrorGeneric: 'An error occurred during registration',
  selectDepartment: 'Select department',
  minPassword: 'Minimum 6 characters',
  systemDesc: 'Company Results Achievement System',
  
  notifications: 'Notifications',
  noNotifications: 'No notifications',
  markAsRead: 'Mark as read',
  markAllAsRead: 'Mark all as read',
  login: 'Login',
  logout: 'Logout',
  signup: 'Sign Up',
  signupPrompt: 'Don\'t have an account? Sign up',
  forgotPassword: 'Forgot password?',
  resetPassword: 'Reset Password',
  confirmPassword: 'Confirm Password',
  signupError: 'Registration failed',
  resetPasswordError: 'Password reset failed',
  resetPasswordSuccess: 'Password reset email sent',
  authRedirect: 'Redirecting...',
  passwordMismatch: 'Passwords do not match',
  
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
  name: 'Name',
  description: 'Description',
  startDate: 'Start Date',
  endDate: 'End Date',
  budget: 'Budget',
  location: 'Location',
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
  
  // All other missing keys with default values
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
  comments: 'Comments',
  writeComment: 'Write Comment',
  commentFailed: 'Comment Failed',
  noComments: 'No Comments',
  unknownUser: 'Unknown User',
  pressCtrlEnter: 'Press Ctrl+Enter',
  pending: 'Pending',
  cancelled: 'Cancelled',
  onHold: 'On Hold',
  estimated: 'Estimated',
  actual: 'Actual',
  created: 'Created',
  participantRemoved: 'Participant Removed',
  removeParticipantFailed: 'Remove Participant Failed',
  inviteParticipant: 'Invite Participant',
  inviteToChat: 'Invite to Chat',
  addParticipantFailed: 'Add Participant Failed',
  addParticipant: 'Add Participant',
  noParticipants: 'No Participants',
  tasksLoadError: 'Tasks Load Error',
  teamDesc: 'Team Description',
  tasksDescription: 'Tasks Description',
  noTasksFound: 'No Tasks Found',
  aiCapabilitiesPersonalized: 'AI Capabilities Personalized',
  aiCapabilitiesWorkload: 'AI Capabilities Workload',
  aiCapabilitiesOptimization: 'AI Capabilities Optimization',
  aiCapabilitiesChat: 'AI Capabilities Chat',
  aiTipTitle: 'AI Tip Title',
  aiTipText: 'AI Tip Text',
  enterAdminKey: 'Enter Admin Key',
  loginToAdmin: 'Login to Admin',
  requestCompleted: 'Request Completed',
  recordsReceived: 'Records Received',
  backupCreated: 'Backup Created',
  fileDownloaded: 'File Downloaded',
  enterTaskName: 'Enter Task Name',
  taskCreatedViaAPI: 'Task Created via API',
  checking: 'Checking',
  systemAdministration: 'System Administration',
  adminModeActive: 'Admin Mode Active',
  fullAccess: 'Full Access',
  mainMenu: 'Main Menu',
  update: 'Update',
  backup: 'Backup',
  database: 'Database',
  totalUsers: 'Total Users',
  activeProfiles: 'Active Profiles',
  totalTasks: 'Total Tasks',
  allTime: 'All Time',
  apiStatus: 'API Status',
  recentTasks: 'Recent Tasks',
  quickActions: 'Quick Actions',
  optimizeDB: 'Optimize DB',
  userManagement: 'User Management',
  exportReports: 'Export Reports',
  systemSettings: 'System Settings',
  completedTasksLabel: 'Completed Tasks',
  activeEmployeesLabel: 'Active Employees',
  averageTimeLabel: 'Average Time',
  achievementsLabel: 'Achievements',
  analyticsTitle: 'Analytics Title',
  performanceAnalysisDesc: 'Performance Analysis Description',
  exportReportLabel: 'Export Report',
  periodLabel: 'Period',
  last7DaysLabel: 'Last 7 Days',
  last30DaysLabel: 'Last 30 Days',
  last3MonthsLabel: 'Last 3 Months',
  lastYearLabel: 'Last Year',
  departmentLabel: 'Department',
  allDepartmentsLabel: 'All Departments',
  forPeriodLabel: 'For Period',
  weeklyPerformanceLabel: 'Weekly Performance',
  plannedVsCompletedLabel: 'Planned vs Completed',
  departmentPerformanceLabel: 'Department Performance',
  tasksAndEfficiencyLabel: 'Tasks and Efficiency',
  awardsTitle: 'Awards Title',
  motivationSystemDesc: 'Motivation System Description',
  createAwardLabel: 'Create Award',
  totalAchievementsLabel: 'Total Achievements',
  issuesTitle: 'Issues Title',
  issueTrackingDesc: 'Issue Tracking Description',
  createIssueLabel: 'Create Issue',
  searchIssuesPlaceholder: 'Search Issues Placeholder',
  statusLabel: 'Status',
  allStatusesLabel: 'All Statuses',
  openStatus: 'Open',
  inProgressStatus: 'In Progress',
  resolvedStatus: 'Resolved',
  closedStatus: 'Closed',
  missionControlTitle: 'Mission Control Title',
  missionControlDesc: 'Mission Control Description',
  
  // Additional missing keys for remaining errors
  missionControlCenter: 'Mission Control Center',
  incoming: 'Incoming',
  mechanical: 'Mechanical',
  electronics: 'Electronics',
  assembly: 'Assembly',
  testing: 'Testing',
  packaging: 'Packaging',
  urgent: 'Urgent',
  normal: 'Normal',
  productionKanban: 'Production Kanban',
  progress: 'Progress',
  assignedTo: 'Assigned To',
  estimatedCompletion: 'Estimated Completion',
  taskStatusUpdated: 'Task Status Updated',
  taskStatusUpdateError: 'Task Status Update Error',
  tasksTitle: 'Tasks Title',
  taskStatus: 'Task Status',
  allStatuses: 'All Statuses',
  taskPriority: 'Task Priority',
  allPriorities: 'All Priorities',
  createdByMe: 'Created By Me',
  noTasksFoundDesc: 'No Tasks Found Description',
  noActiveTasks: 'No Active Tasks',
  noActiveTasksDesc: 'No Active Tasks Description',
  noCreatedTasks: 'No Created Tasks',
  noCreatedTasksDesc: 'No Created Tasks Description',
  away: 'Away',
  offline: 'Offline',
  unknown: 'Unknown',
  administrator: 'Administrator',
  intern: 'Intern',
  teamManagementDesc: 'Team Management Description',
  addEmployeeLabel: 'Add Employee',
  loadingTeamLabel: 'Loading Team',
  dataLoadErrorLabel: 'Data Load Error',
  technicalStatus: 'Technical Status',
};

export const translations: Record<string, Translations> = {
  en: baseTranslations,
  
  ru: {
    ...baseTranslations,
    // Russian overrides for key terms
    title: 'ТИГР CRM',
    welcome: 'Добро пожаловать',
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
    dronesInFlight: 'Беспилотники в полете',
    systemHealth: 'Исправность системы',
    operatorsOnline: 'Операторов в сети',
    unitsInProduction: 'Единиц в производстве',
    increaseCapacity: 'Увеличение производственной мощности до 100 единиц/месяц',
    productionUnit: 'Производство',
    quality: 'Качество',
    deadline: 'Дедлайн',
    lastUpdateTime: 'Последнее обновление',
    technicalStatus: 'Техническое состояние',
    
    // Auth & Forms Russian
    auth: 'Авторизация',
    signIn: 'Вход',
    signUp: 'Регистрация',
    registration: 'Регистрация',
    email: 'Email',
    password: 'Пароль',
    fullName: 'Полное имя',
    position: 'Должность',
    department: 'Подразделение',
    phone: 'Телефон',
    telegram: 'Telegram',
    signingIn: 'Вход...',
    registering: 'Регистрация...',
    enterSystem: 'Войдите в систему или создайте новый аккаунт',
    successLogin: 'Успешный вход',
    welcomeToTiger: 'Добро пожаловать в Tiger CRM!',
    loginError: 'Ошибка входа',
    registrationSuccess: 'Регистрация успешна!',
    checkEmail: 'Проверьте email для подтверждения аккаунта (или войдите сразу если отключено подтверждение)',
    registrationError: 'Ошибка регистрации',
    invalidCredentials: 'Неверный email или пароль',
    emailNotConfirmed: 'Подтвердите email перед входом',
    userExists: 'Пользователь с таким email уже существует',
    weakPassword: 'Пароль слишком слабый. Минимум 6 символов',
    loginErrorGeneric: 'Произошла ошибка при входе',
    registrationErrorGeneric: 'Произошла ошибка при регистрации',
    selectDepartment: 'Выберите подразделение',
    minPassword: 'Минимум 6 символов',
    systemDesc: 'Система достижения результатов компании',
  },
  
  bg: {
    ...baseTranslations,
    // Bulgarian overrides for key terms
    title: 'TIGER CRM',
    welcome: 'Добре дошли',
    operationalCenter: 'Операционен център',
    uavSystem: 'Система за управление на БЛА',
    missionControl: 'Център за управление',
    tasks: 'Задачи',
    team: 'Екип',
    projects: 'Проекти',
    analytics: 'Аналитика',
    issues: 'Проблеми',
    admin: 'Админ',
    operations: 'Операции',
    production: 'Производство',
    maintenance: 'Поддръжка',
    documents: 'Документооборот',
    integrations: 'Интеграции',
    strategicGoal: 'Стратегическа цел',
    activeMissionsLabel: 'Активни мисии',
    productionConveyor: 'Производствен конвейер',
    systemStatusLabel: 'Състояние на системата',
    onTrackStatus: 'НА ПЪТ',
    armedStatus: 'ВЪОРЪЖЕН',
    readyStatus: 'ГОТОВ',
    infoStatus: 'ИНФО',
    warningStatus: 'ПРЕДУПРЕЖДЕНИЕ',
    okStatus: 'ОК',
    attentionStatus: 'ВНИМАНИЕ',
    dronesInFlight: 'Дронове в полет',
    systemHealth: 'Здраве на системата',
    operatorsOnline: 'Оператори онлайн',
    unitsInProduction: 'Единици в производство',
    increaseCapacity: 'Увеличаване на производствения капацитет до 100 единици/месец',
    productionUnit: 'Производство',
    quality: 'Качество',
    deadline: 'Краен срок',
    lastUpdateTime: 'Последна актуализация',
    technicalStatus: 'Техническо състояние',
    
    // Auth & Forms Bulgarian
    auth: 'Оторизация',
    signIn: 'Влизане',
    signUp: 'Регистрация',
    registration: 'Регистрация',
    email: 'Email',
    password: 'Парола',
    fullName: 'Пълно име',
    position: 'Длъжност',
    department: 'Отдел',
    phone: 'Телефон',
    telegram: 'Telegram',
    signingIn: 'Влизане...',
    registering: 'Регистрация...',
    enterSystem: 'Влезте в системата или създайте нов акаунт',
    successLogin: 'Успешно влизане',
    welcomeToTiger: 'Добре дошли в Tiger CRM!',
    loginError: 'Грешка при влизане',
    registrationSuccess: 'Регистрацията е успешна!',
    checkEmail: 'Проверете email-а си за потвърждение на акаунта (или влезте веднага ако потвърждението е изключено)',
    registrationError: 'Грешка при регистрация',
    invalidCredentials: 'Неправилен email или парола',
    emailNotConfirmed: 'Потвърдете email-а си преди влизане',
    userExists: 'Потребител с този email вече съществува',
    weakPassword: 'Паролата е твърде слаба. Минимум 6 символа',
    loginErrorGeneric: 'Възникна грешка при влизане',
    registrationErrorGeneric: 'Възникна грешка при регистрация',
    selectDepartment: 'Изберете отдел',
    minPassword: 'Минимум 6 символа',
    systemDesc: 'Система за постигане на резултати от компанията',
  }
};