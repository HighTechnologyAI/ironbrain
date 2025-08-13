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
  invitedToTask: string;
  acceptInvitation: string;
  declineInvitation: string;
  invitationAccepted: string;
  invitationDeclined: string;
  
  // Chat and invitations
  inviteToChat: string;
  chatInvitation: string;
  inviteParticipant: string;
  removeFromChat: string;
  fileAttached: string;
  
  // Users
  unknownUser: string;
  userNotFound: string;
  
  // Files and attachments
  attachments: string;
  addFile: string;
  filesUploaded: string;
  fileDeleted: string;
  uploadFailed: string;
  downloadFailed: string;
  deleteFailed: string;
  unsupportedFileType: string;
  fileTooLarge: string;
  
  // Comments
  comments: string;
  noComments: string;
  writeComment: string;
  commentAdded: string;
  commentFailed: string;
  pressCtrlEnter: string;
  
  // Participants
  participants: string;
  noParticipants: string;
  addParticipant: string;
  participantAdded: string;
  participantRemoved: string;
  addParticipantFailed: string;
  removeParticipantFailed: string;
  
  // Navigation
  dashboard: string;
  tasks: string;
  team: string;
  projects: string;
  issues: string;
  awards: string;
  analytics: string;
  admin: string;
  logout: string;

  // Team page
  teamManagement: string;
  addEmployee: string;
  loadingTeam: string;
  dataLoadError: string;
  tryAgain: string;
  employee: string;
  department: string;
  since: string;
  status: string;
  noTeamMembers: string;
  administrator: string;
  manager: string;
  intern: string;
  unknown: string;
  away: string;
  offline: string;

  // Index page
  goingToTasks: string;
  openingTasksList: string;
  goingToTeam: string;
  openingTeamManagement: string;
  goingToAchievements: string;
  openingAchievements: string;
  personalTasksDesc: string;
  teamDesc: string;
  projectsDesc: string;
  analyticsDesc: string;
  problemsDesc: string;
  achievementsDesc: string;
  adminDesc: string;
  perWeek: string;
  active: string;
  users: string;
  aiAssistantDesc: string;
  personalization: string;
  smartTasks: string;
  loadAnalysis: string;
  
  // Tasks
  tasksTitle: string;
  tasksDescription: string;
  allTasks: string;
  myTasks: string;
  createdByMe: string;
  taskStatus: string;
  taskPriority: string;
  searchTasks: string;
  createTask: string;
  startWork: string;
  complete: string;
  assignee: string;
  dueDate: string;
  estimated: string;
  actual: string;
  hours: string;
  created: string;
  noTasksFound: string;
  noTasksFoundDesc: string;
  noActiveTasks: string;
  noActiveTasksDesc: string;
  noCreatedTasks: string;
  noCreatedTasksDesc: string;
  
  // Task Status
  pending: string;
  inProgress: string;
  completed: string;
  cancelled: string;
  onHold: string;
  
  // Task Priority
  low: string;
  medium: string;
  high: string;
  critical: string;
  
  // Statuses
  allStatuses: string;
  allPriorities: string;
  
  // Messages
  taskStatusUpdated: string;
  taskStatusUpdateError: string;
  tasksLoadError: string;

  // AI Assistant
  aiAssistantReadyTitle: string;
  aiAssistantReadyDesc: string;
  aiErrorTitle: string;
  aiErrorDesc: string;
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
  aiModeCreateTask: string;
  aiModeAnalyzeWorkload: string;
  aiModeSuggestOptimization: string;
  aiModeChat: string;
  aiCapabilitiesPersonalized: string;
  aiCapabilitiesWorkload: string;
  aiCapabilitiesOptimization: string;
  aiCapabilitiesChat: string;
  aiTipTitle: string;
  aiTipText: string;
  taskCreatedTitle: string;
  taskAssigned: string;
  taskCreationError: string;

  // Strategic Banner
    strategicLoadingTitle: string;
    strategicLoadingDesc: string;
    strategicFocusTitle: string;
    strategicNotFound: string;
    strategicStatus: string;
    strategicBudgetPlanned: string;
    strategicProgress: string;
    strategicTarget: string;
    strategicCurrent: string;
    location: string;
    targetDate: string;
    statusPlanned: string;
    statusActive: string;
    statusDone: string;
    statusOnHold: string;

    // Auth
    authTitle: string;
    authDesc: string;
    signIn: string;
    signUp: string;
    email: string;
    password: string;
    fullName: string;
    position: string;
    phone: string;
    telegram: string;
    signInCta: string;
    signingIn: string;
    signUpCta: string;
    signingUp: string;
    selectDepartment: string;
    loginSuccessTitle: string;
    loginSuccessDesc: string;
    loginErrorTitle: string;
    loginInvalidCredentials: string;
    loginEmailNotConfirmed: string;
    signupSuccessTitle: string;
    signupSuccessDesc: string;
    signupErrorTitle: string;
    signupUserExists: string;
    signupWeakPassword: string;

    // Department options
    depManagement: string;
    depMarketing: string;
    depExpertise: string;
    depProduction: string;
    depLeadership: string;
    depIT: string;
    depConsulting: string;

    // Online Users
    onlineUsersTitle: string;
    activeUsersInSystem: string;
    noActiveUsers: string;
    moreUsersOnlinePrefix: string;
    moreUsersOnlineSuffix: string;

    // Smart AI Sidebar
    smartAISidebar: string;
    taskSummary: string;
    riskAnalysis: string;
    recommendedActions: string;
    taskIntelligence: string;
    complexity: string;
    timeEstimation: string;
    smartAITags: string;
    aiActions: string;
    generateSummary: string;
    suggestSubtasks: string;
    findExperts: string;
    riskLevel: string;
    riskHigh: string;
    riskMedium: string;
    riskLow: string;
    noTaskSelected: string;
    selectTaskToSeeInsights: string;
    riskCritical: string;
    // Analytics and Reports
    exportReport: string;
    period: string;
    analyticsDepartment: string;
    allDepartments: string;
    weekPerformance: string;
    departmentPerformance: string;
    topPerformers: string;
    efficiency: string;
    lastDays: string;
    lastMonth: string;
    last3Months: string;
    lastYear: string;
    overdue: string;
    
    // Production & UAV Dashboard
    production: string;
    productionKanban: string;
    uavDashboard: string;
    missionControl: string;
    serialNumber: string;
    model: string;
    stage: string;
    progress: string;
    assignedTo: string;
    estimatedCompletion: string;
    priority: string;
    normal: string;
    urgent: string;
    incoming: string;
    mechanical: string;
    electronics: string;
    assembly: string;
    testing: string;
    packaging: string;
    hoursUnit: string;
    minutes: string;
    systemHealth: string;
    operational: string;
    maintenance: string;
    documents: string;
    maintenanceCenter: string;
    documentCenter: string;
    integrations: string;
    systemStats: string;
    totalUsers: string;
    totalTasks: string;
    apiStatus: string;
    database: string;
    recentTasks: string;
    quickActions: string;
    optimizeDB: string;
    userManagement: string;
    exportReports: string;
    systemSettings: string;
    adminPanel: string;
    adminKey: string;
    enterAdminKey: string;
    checking: string;
    loginToAdmin: string;
    systemAdministration: string;
    adminModeActive: string;
    fullAccess: string;
    mainMenu: string;
    update: string;
    backup: string;
    backupCreated: string;
    fileDownloaded: string;
    requestCompleted: string;
    recordsReceived: string;
    taskCreatedViaAPI: string;
    enterTaskName: string;
    authError: string;
    invalidAdminKey: string;
    allTime: string;
    activeProfiles: string;

    // UAV Dashboard
    operationalCenter: string;
    uavSystem: string;
    welcomeUser: string;
    systems: string;
    ready: string;
    launchMission: string;
    strategicGoal: string;
    increaseCapacity: string;
    onTrack: string;
    completion: string;
    monthlyGrowth: string;
    productionUnit: string;
    qualityLabel: string;
    deadlineLabel: string;
    activeMissionsLabel: string;
    productionConveyor: string;
    technicalStatus: string;
    teamOnline: string;
    unitsInFlight: string;
    unitsInProduction: string;
    systemHealthStatus: string;
    operatorsOnline: string;
    systemStatusLabel: string;
    databaseLabel: string;
    temperatureLabel: string;
    batteryLabel: string;
    communicationLabel: string;
    lastUpdateLabel: string;
    quickActionsLabel: string;
    tasksLabel: string;
    analyticsLabel: string;
    problemsLabel: string;
    
    // Mission Control
    missionControlTitle: string;
    missionControlCenter: string;
    weatherConditions: string;
    windLabel: string;
    visibilityLabel: string;
    gpsSignalLabel: string;
    excellentLabel: string;
    activeMissionsTitle: string;
    waypointsLabel: string;
    altitudeLabel: string;
    flightTimeLabel: string;
    progressLabel: string;
    mapLabel: string;
    detailsLabel: string;
    fleetStatusLabel: string;
    tacticalMapLabel: string;
    mapboxIntegrationLabel: string;
    armedStatus: string;
    inFlightStatus: string;
    planningStatus: string;
    completedStatus: string;
    abortedStatus: string;
    warningStatus: string;
    criticalStatus: string;
    lowStatus: string;
    highStatus: string;
    
    // Analytics
    analyticsTitle: string;
    performanceAnalysisDesc: string;
    exportReportLabel: string;
    periodLabel: string;
    departmentLabel: string;
    allDepartmentsLabel: string;
    last7DaysLabel: string;
    last30DaysLabel: string;
    last3MonthsLabel: string;
    lastYearLabel: string;
    completedTasksLabel: string;
    activeEmployeesLabel: string;
    averageTimeLabel: string;
    achievementsLabel: string;
    forPeriodLabel: string;
    weeklyPerformanceLabel: string;
    plannedVsCompletedLabel: string;
    departmentPerformanceLabel: string;
    tasksAndEfficiencyLabel: string;
    topPerformersLabel: string;
    tasksCompletedLabel: string;
    efficiencyLabel: string;
    
    // Issues
    issuesTitle: string;
    issueTrackingDesc: string;
    createIssueLabel: string;
    searchIssuesPlaceholder: string;
    statusLabel: string;
    priorityLabel: string;
    allStatusesLabel: string;
    openStatus: string;
    inProgressStatus: string;
    resolvedStatus: string;
    closedStatus: string;
    allPrioritiesLabel: string;
    taskLabel: string;
    createdByLabel: string;
    assignedToLabel: string;
    createdDateLabel: string;
    noIssuesFoundLabel: string;
    noIssuesYetLabel: string;
    
    // Awards
    awardsTitle: string;
    motivationSystemDesc: string;
    createAwardLabel: string;
    totalAchievementsLabel: string;
    awardsTodayLabel: string;
    overallRatingLabel: string;
    activeParticipantsLabel: string;
    availableAchievementsLabel: string;
    searchAchievementsPlaceholder: string;
    categoryLabel: string;
    allCategoriesLabel: string;
    starterCategory: string;
    productivityCategory: string;
    teamworkCategory: string;
    milestoneCategory: string;
    noAchievementsCreatedLabel: string;
    createFirstAchievementLabel: string;
    recentAwardsLabel: string;
    noAwardsYetLabel: string;
    awardsWillAppearLabel: string;
    leaderboardLabel: string;
    pointsLabel: string;
    
    // Team
    teamManagementDesc: string;
    addEmployeeLabel: string;
    loadingTeamLabel: string;
    dataLoadErrorLabel: string;
    tryAgainLabel: string;
    noTeamMembersLabel: string;
    sinceLabel: string;
    editLabel: string;
    roleLabel: string;
    cancelLabel: string;
    saveLabel: string;
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

    // AI Assistant
    aiAssistantReadyTitle: 'AI analysis ready',
    aiAssistantReadyDesc: 'Tiger AI has responded with insights',
    aiErrorTitle: 'AI Error',
    aiErrorDesc: 'Failed to get a response from AI',
    aiMessageRequired: 'Enter a message for the AI assistant',
    aiEmployeeRequired: 'Select an employee',
    aiProcessing: 'AI processing...',
    aiRequest: 'Ask Tiger AI',
    aiModeLabel: 'AI Assistant Mode',
    aiModePlaceholder: 'Select mode',
    aiEmployeePlaceholder: 'Select an employee',
    aiTaskDescriptionLabel: 'Task description',
    aiMessageLabel: 'Message for AI',
    aiPlaceholderCreateTask: 'Describe the task in free form. AI will create a personalized task considering the employee\'s skills...',
    aiPlaceholderSuggestOptimization: 'Describe a problem or an area to optimize...',
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
    smartAITags: 'Tags:',
    aiRecommendations: 'Recommendations:',
    aiWorkloadStatus: 'Workload status:',
    aiAnalysis: 'Analysis:',
    aiOptimizations: 'Optimizations:',
    aiSkillDevelopment: 'Skill development:',
    aiAnswer: 'Answer:',
    aiModeCreateTask: 'Create task',
    aiModeAnalyzeWorkload: 'Workload analysis',
    aiModeSuggestOptimization: 'Optimization suggestions',
    aiModeChat: 'Free chat',
    aiCapabilitiesPersonalized: 'Personalized tasks',
    aiCapabilitiesWorkload: 'Workload analysis',
    aiCapabilitiesOptimization: 'Process optimization',
    aiCapabilitiesChat: 'Free dialog',
    aiTipTitle: 'Tip from Tiger AI',
    aiTipText: 'Describe the task in free form and AI will create a personalized assignment considering skills and workload.',
    taskCreatedTitle: 'Task created!',
    taskAssigned: 'Assigned to employee',
    taskCreationError: 'Failed to create task',
    
    // Notifications
    notifications: 'Notifications',
    noNotifications: 'No notifications',
    markAsRead: 'Mark as read',
    markAllAsRead: 'Mark all as read',
    invitedToTask: 'Task invitation',
    acceptInvitation: 'Accept',
    declineInvitation: 'Decline',
    invitationAccepted: 'Invitation accepted',
    invitationDeclined: 'Invitation declined',
    
    // Chat and invitations
    inviteToChat: 'Invite to chat',
    chatInvitation: 'Task chat invitation',
    inviteParticipant: 'Invite participant',
    removeFromChat: 'Remove from chat',
    fileAttached: 'File attached',
    
    // Users
    unknownUser: 'Unknown user',
    userNotFound: 'User not found',
    
    // Files and attachments
    attachments: 'Attachments',
    addFile: 'Add file',
    filesUploaded: 'Files uploaded',
    fileDeleted: 'File deleted',
    uploadFailed: 'Upload failed',
    downloadFailed: 'Download failed',
    deleteFailed: 'Delete failed',
    unsupportedFileType: 'Unsupported file type',
    fileTooLarge: 'File too large',
    
    // Comments
    comments: 'Comments',
    noComments: 'No comments',
    writeComment: 'Write a comment...',
    commentAdded: 'Comment added',
    commentFailed: 'Failed to add comment',
    pressCtrlEnter: 'Ctrl+Enter to send',
    
    // Participants
    participants: 'Participants',
    noParticipants: 'No participants',
    addParticipant: 'Add participant',
    participantAdded: 'Participant added',
    participantRemoved: 'Participant removed',
    addParticipantFailed: 'Failed to add participant',
    removeParticipantFailed: 'Failed to remove participant',
    
    // Navigation
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    team: 'Team',
    projects: 'Projects',
    issues: 'Issues',
    awards: 'Awards',
    analytics: 'Analytics',
    admin: 'Admin',
    logout: 'Logout',

    // Team page
    teamManagement: 'Team management',
    addEmployee: 'Add employee',
    loadingTeam: 'Loading team...',
    dataLoadError: 'Data loading error',
    tryAgain: 'Try again',
    employee: 'Employee',
    department: 'Department',
    since: 'Since',
    status: 'Status',
    noTeamMembers: 'No team members. Add first employee.',
    administrator: 'Administrator',
    manager: 'Manager',
    intern: 'Intern',
    unknown: 'Unknown',
    away: 'Away',
    offline: 'Offline',

    // Index page
    goingToTasks: 'Going to tasks',
    openingTasksList: 'Opening tasks list...',
    goingToTeam: 'Going to team',
    openingTeamManagement: 'Opening team management...',
    goingToAchievements: 'Going to achievements',
    openingAchievements: 'Opening awards and achievements...',
    personalTasksDesc: 'Personal task management',
    teamDesc: 'Team and employees',
    projectsDesc: 'Active projects',
    analyticsDesc: 'Analytics and reports',
    problemsDesc: 'Issues requiring attention',
    achievementsDesc: 'Awards and achievements',
    adminDesc: 'System management and external control',
    perWeek: 'per week',
    active: 'Active',
    users: 'users',
    aiAssistantDesc: 'Personal assistant for creating tasks taking into account the skills of each employee',
    personalization: 'Personalization',
    smartTasks: 'Smart tasks',
    loadAnalysis: 'Load analysis',
    
    // Tasks
    tasksTitle: 'Task Management',
    tasksDescription: 'Create and track tasks for your team',
    allTasks: 'All tasks',
    myTasks: 'My tasks',
    createdByMe: 'Created by me',
    taskStatus: 'Status',
    taskPriority: 'Priority',
    searchTasks: 'Search tasks...',
    createTask: 'Create task',
    startWork: 'Start work',
    complete: 'Complete',
    assignee: 'Assignee',
    dueDate: 'Due',
    estimated: 'Estimated',
    actual: 'Actual',
    hours: 'h',
    created: 'Created',
    noTasksFound: 'No tasks found',
    noTasksFoundDesc: 'Create your first task or change search filters',
    noActiveTasks: 'You have no active tasks',
    noActiveTasksDesc: 'Tasks assigned to you will appear here',
    noCreatedTasks: 'You haven\'t created any tasks yet',
    noCreatedTasksDesc: 'Click "Create task" to get started',
    
    // Task Status
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    onHold: 'On Hold',
    
    // Task Priority
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
    
    // Statuses
    allStatuses: 'All statuses',
    allPriorities: 'All priorities',
    
    // Messages
    taskStatusUpdated: 'Task status updated',
    taskStatusUpdateError: 'Failed to update task status',
    tasksLoadError: 'Failed to load tasks',
    // Strategic Banner
    strategicLoadingTitle: 'Loading strategy…',
    strategicLoadingDesc: 'Fetching objective and key results',
    strategicFocusTitle: 'Strategic focus',
    strategicNotFound: 'Strategic objective not found',
    strategicStatus: 'Status',
    strategicBudgetPlanned: 'Planned budget',
    strategicProgress: 'Progress',
    strategicTarget: 'Target',
    strategicCurrent: 'Current',
    location: 'Location',
    targetDate: 'Target date',
    statusPlanned: 'Planned',
    statusActive: 'Active',
    statusDone: 'Done',
    statusOnHold: 'On hold',

    // Auth
    authTitle: 'Authentication',
    authDesc: 'Sign in or create a new account',
    signIn: 'Sign in',
    signUp: 'Sign up',
    email: 'Email',
    password: 'Password',
    fullName: 'Full name',
    position: 'Position',
    phone: 'Phone',
    telegram: 'Telegram',
    signInCta: 'Sign in',
    signingIn: 'Signing in...',
    signUpCta: 'Create account',
    signingUp: 'Registering...',
    selectDepartment: 'Select department',
    loginSuccessTitle: 'Signed in successfully',
    loginSuccessDesc: 'Welcome to Tiger CRM!',
    loginErrorTitle: 'Sign-in error',
    loginInvalidCredentials: 'Invalid email or password',
    loginEmailNotConfirmed: 'Please confirm your email before signing in',
    signupSuccessTitle: 'Registration successful!',
    signupSuccessDesc: 'Check your email to confirm your account',
    signupErrorTitle: 'Registration error',
    signupUserExists: 'A user with this email already exists',
    signupWeakPassword: 'Weak password. Minimum 6 characters',

    // Department options
    depManagement: 'Management',
    depMarketing: 'Marketing',
    depExpertise: 'Expertise',
    depProduction: 'Production',
    depLeadership: 'Leadership',
    depIT: 'IT',
    depConsulting: 'Consulting',

    // Online Users
    onlineUsersTitle: 'Online users',
    activeUsersInSystem: 'Active users in the system',
    noActiveUsers: 'No active users',
    moreUsersOnlinePrefix: '+',
    moreUsersOnlineSuffix: ' more users online',

    // Smart AI Sidebar
    smartAISidebar: 'Smart AI Sidebar',
    taskSummary: 'Task Summary',
    riskAnalysis: 'Risk Analysis',
    recommendedActions: 'Recommended Actions',
    taskIntelligence: 'Task Intelligence',
    complexity: 'Complexity',
    timeEstimation: 'Time Estimation',
    aiTags: 'Tags',
    aiActions: 'AI Actions',
    generateSummary: 'Generate Summary',
    suggestSubtasks: 'Suggest Subtasks',
    findExperts: 'Find Experts',
    riskLevel: 'Risk Level',
    riskHigh: 'High',
    riskMedium: 'Medium',
    riskLow: 'Low',
    riskCritical: 'Critical',
    noTaskSelected: 'No task selected',
    selectTaskToSeeInsights: 'Select a task to see AI insights',
    // Analytics and Reports
    exportReport: 'Export Report',
    period: 'Period',
    analyticsDepartment: 'Department',
    allDepartments: 'All Departments',
    weekPerformance: 'Weekly Performance',
    departmentPerformance: 'Department Performance',
    topPerformers: 'Top Performers',
    efficiency: 'Efficiency',
    lastDays: 'Last 7 days',
    lastMonth: 'Last 30 days',
    last3Months: 'Last 3 months',
    lastYear: 'Last year',
    overdue: 'Overdue',
    
    // Production & UAV Dashboard
    production: 'Production',
    productionKanban: 'Production Kanban',
    uavDashboard: 'UAV Dashboard',
    missionControl: 'Mission Control',
    serialNumber: 'Serial Number',
    model: 'Model',
    stage: 'Stage',
    progress: 'Progress',
    assignedTo: 'Assigned To',
    estimatedCompletion: 'Estimated Completion',
    priority: 'Priority',
    normal: 'Normal',
    urgent: 'Urgent',
    incoming: 'Incoming',
    mechanical: 'Mechanical',
    electronics: 'Electronics',
    assembly: 'Assembly',
    testing: 'Testing',
    packaging: 'Packaging',
    hoursUnit: 'hours',
    minutes: 'minutes',
    systemHealth: 'System Health',
    operational: 'Operational',
    maintenance: 'Maintenance',
    documents: 'Documents',
    maintenanceCenter: 'Maintenance Center',
    documentCenter: 'Document Center',
    integrations: 'Integrations',
    systemStats: 'System Statistics',
    totalUsers: 'Total Users',
    totalTasks: 'Total Tasks',
    apiStatus: 'API Status',
    database: 'Database',
    recentTasks: 'Recent Tasks',
    quickActions: 'Quick Actions',
    optimizeDB: 'Optimize Database',
    userManagement: 'User Management',
    exportReports: 'Export Reports',
    systemSettings: 'System Settings',
    adminPanel: 'Admin Panel',
    adminKey: 'Admin Key',
    enterAdminKey: 'Enter admin key',
    checking: 'Checking...',
    loginToAdmin: 'Login to admin panel',
    systemAdministration: 'System administration and monitoring',
    adminModeActive: 'Administrator mode active',
    fullAccess: 'Full access to system functions and management',
    mainMenu: 'Main Menu',
    update: 'Update',
    backup: 'Backup',
    backupCreated: 'Backup created',
    fileDownloaded: 'File downloaded to your computer',
    requestCompleted: 'Request completed',
    recordsReceived: 'records received',
    taskCreatedViaAPI: 'Task created via API',
    enterTaskName: 'Enter task name',
    authError: 'Authentication error',
    invalidAdminKey: 'Invalid admin key',
    allTime: 'All time',
    activeProfiles: 'Active profiles',

    // UAV Dashboard
    operationalCenter: 'Operational Control Center',
    uavSystem: 'UAV Mission and Production Management System',
    welcomeUser: 'Welcome',
    systems: 'Systems',
    ready: 'READY',
    launchMission: 'Launch Mission',
    strategicGoal: 'Strategic Goal',
    increaseCapacity: 'Increase production capacity to 100 units/month',
    onTrack: 'ON TRACK',
    completion: 'completion',
    monthlyGrowth: '+12% per month',
    productionUnit: 'Production',
    qualityLabel: 'Quality',
    deadlineLabel: 'Deadline',
    activeMissionsLabel: 'Active Missions',
    productionConveyor: 'Production Conveyor',
    technicalStatus: 'Technical Status',
    teamOnline: 'Team Online',
    unitsInFlight: 'Drones in flight',
    unitsInProduction: 'Units in production',
    systemHealthStatus: 'System health',
    operatorsOnline: 'Operators online',
    systemStatusLabel: 'System Status',
    databaseLabel: 'DB',
    temperatureLabel: 'Temp',
    batteryLabel: 'Battery',
    communicationLabel: 'Comm',
    lastUpdateLabel: 'Last update',
    quickActionsLabel: 'Quick Actions',
    tasksLabel: 'Tasks',
    analyticsLabel: 'Analytics',
    problemsLabel: 'Problems',
    
    // Mission Control
    missionControlTitle: 'Mission Control',
    missionControlCenter: 'UAV Mission Control Center',
    weatherConditions: 'Weather Conditions',
    windLabel: 'Wind',
    visibilityLabel: 'Visibility',
    gpsSignalLabel: 'GPS Signal',
    excellentLabel: 'Excellent',
    activeMissionsTitle: 'Active Missions',
    waypointsLabel: 'Waypoints',
    altitudeLabel: 'Altitude',
    flightTimeLabel: 'Flight time',
    progressLabel: 'Progress',
    mapLabel: 'Map',
    detailsLabel: 'Details',
    fleetStatusLabel: 'Fleet Status',
    tacticalMapLabel: 'Tactical Map',
    mapboxIntegrationLabel: 'Mapbox GL JS integration pending',
    armedStatus: 'ARMED',
    inFlightStatus: 'IN FLIGHT',
    planningStatus: 'PLANNING',
    completedStatus: 'COMPLETED',
    abortedStatus: 'ABORTED',
    warningStatus: 'WARNING',
    criticalStatus: 'CRITICAL',
    lowStatus: 'LOW',
    highStatus: 'HIGH',
    
    // Analytics
    analyticsTitle: 'Analytics',
    performanceAnalysisDesc: 'Performance analysis and team metrics',
    exportReportLabel: 'Export Report',
    periodLabel: 'Period',
    departmentLabel: 'Department',
    allDepartmentsLabel: 'All departments',
    last7DaysLabel: 'Last 7 days',
    last30DaysLabel: 'Last 30 days',
    last3MonthsLabel: 'Last 3 months',
    lastYearLabel: 'Last year',
    completedTasksLabel: 'Completed tasks',
    activeEmployeesLabel: 'Active employees',
    averageTimeLabel: 'Average time',
    achievementsLabel: 'Achievements',
    forPeriodLabel: 'for period',
    weeklyPerformanceLabel: 'Weekly Performance',
    plannedVsCompletedLabel: 'Planned vs completed tasks',
    departmentPerformanceLabel: 'Department Performance',
    tasksAndEfficiencyLabel: 'Tasks and efficiency by departments',
    topPerformersLabel: 'Top Performers',
    tasksCompletedLabel: 'tasks completed',
    efficiencyLabel: 'efficiency',
    
    // Issues
    issuesTitle: 'Issues',
    issueTrackingDesc: 'Issue and bug tracking system',
    createIssueLabel: 'Create Issue',
    searchIssuesPlaceholder: 'Search issues...',
    statusLabel: 'Status',
    priorityLabel: 'Priority',
    allStatusesLabel: 'All statuses',
    openStatus: 'Open',
    inProgressStatus: 'In Progress',
    resolvedStatus: 'Resolved',
    closedStatus: 'Closed',
    allPrioritiesLabel: 'All priorities',
    taskLabel: 'Task',
    createdByLabel: 'Created by',
    assignedToLabel: 'Assigned to',
    createdDateLabel: 'Created',
    noIssuesFoundLabel: 'No issues found with specified criteria',
    noIssuesYetLabel: 'No open issues. Create the first issue for tracking.',
    
    // Awards
    awardsTitle: 'Awards and Achievements',
    motivationSystemDesc: 'Motivation and recognition system',
    createAwardLabel: 'Create Award',
    totalAchievementsLabel: 'Total achievements',
    awardsTodayLabel: 'Awards today',
    overallRatingLabel: 'Overall rating',
    activeParticipantsLabel: 'Active participants',
    availableAchievementsLabel: 'Available achievements',
    searchAchievementsPlaceholder: 'Search achievements...',
    categoryLabel: 'Category',
    allCategoriesLabel: 'All categories',
    starterCategory: 'Starter',
    productivityCategory: 'Productivity',
    teamworkCategory: 'Teamwork',
    milestoneCategory: 'Milestone',
    noAchievementsCreatedLabel: 'No achievements created yet',
    createFirstAchievementLabel: 'Create first achievement to motivate team!',
    recentAwardsLabel: 'Recent Awards',
    noAwardsYetLabel: 'No awards yet',
    awardsWillAppearLabel: 'Awards will appear here after creation',
    leaderboardLabel: 'Leaderboard',
    pointsLabel: 'points',
    
    // Team
    teamManagementDesc: 'Team member management',
    addEmployeeLabel: 'Add Employee',
    loadingTeamLabel: 'Loading team...',
    dataLoadErrorLabel: 'Data loading error',
    tryAgainLabel: 'Try again',
    noTeamMembersLabel: 'No team members. Add the first employee.',
    sinceLabel: 'Since',
    editLabel: 'Edit',
    roleLabel: 'Role',
    cancelLabel: 'Cancel',
    saveLabel: 'Save',
  },
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
    aiAssistant: 'AI Помощник',

    // AI Assistant
    aiAssistantReadyTitle: 'AI анализ готов',
    aiAssistantReadyDesc: 'Получен ответ от Tiger AI',
    aiErrorTitle: 'Ошибка AI',
    aiErrorDesc: 'Не удалось получить ответ от AI',
    aiMessageRequired: 'Введите сообщение для AI помощника',
    aiEmployeeRequired: 'Выберите сотрудника',
    aiProcessing: 'AI обрабатывает...',
    aiRequest: 'Запросить Tiger AI',
    aiModeLabel: 'Режим AI помощника',
    aiModePlaceholder: 'Выберите режим',
    aiEmployeePlaceholder: 'Выберите сотрудника',
    aiTaskDescriptionLabel: 'Описание задачи',
    aiMessageLabel: 'Сообщение для AI',
    aiPlaceholderCreateTask: 'Опишите задачу в свободной форме. AI создаст персонализированную задачу с учетом навыков сотрудника...',
    aiPlaceholderSuggestOptimization: 'Опишите проблему или область для оптимизации...',
    aiPlaceholderChat: 'Задайте любой вопрос по управлению задачами...',
    aiResponseTitle: 'Ответ Tiger AI',
    aiBadgeTask: 'Задача',
    aiBadgeAnalysis: 'Анализ',
    aiBadgeOptimization: 'Оптимизация',
    aiBadgeChat: 'Чат',
    aiTaskName: 'Название задачи:',
    aiDescription: 'Описание:',
    aiPriority: 'Приоритет',
    aiTime: 'Время',
    smartAITags: 'Теги:',
    aiRecommendations: 'Рекомендации:',
    aiWorkloadStatus: 'Статус нагрузки:',
    aiAnalysis: 'Анализ:',
    aiOptimizations: 'Оптимизации:',
    aiSkillDevelopment: 'Развитие навыков:',
    aiAnswer: 'Ответ:',
    aiModeCreateTask: 'Создать задачу',
    aiModeAnalyzeWorkload: 'Анализ нагрузки',
    aiModeSuggestOptimization: 'Оптимизация',
    aiModeChat: 'Свободный чат',
    aiCapabilitiesPersonalized: 'Персонализированные задачи',
    aiCapabilitiesWorkload: 'Анализ рабочей нагрузки',
    aiCapabilitiesOptimization: 'Оптимизация процессов',
    aiCapabilitiesChat: 'Свободный диалог',
    aiTipTitle: 'Совет Tiger AI',
    aiTipText: 'Опишите задачу в свободной форме, и AI создаст персонализированное задание с учетом навыков и загрузки сотрудника.',
    taskCreatedTitle: 'Задача создана!',
    taskAssigned: 'Назначена сотруднику',
    taskCreationError: 'Не удалось создать задачу',
    
    // Notifications
    notifications: 'Уведомления',
    noNotifications: 'Нет уведомлений',
    markAsRead: 'Отметить как прочитанное',
    markAllAsRead: 'Отметить все как прочитанные',
    invitedToTask: 'Приглашение в задачу',
    acceptInvitation: 'Принять',
    declineInvitation: 'Отклонить',
    invitationAccepted: 'Приглашение принято',
    invitationDeclined: 'Приглашение отклонено',
    
    // Chat and invitations
    inviteToChat: 'Пригласить в чат',
    chatInvitation: 'Приглашение в чат задачи',
    inviteParticipant: 'Пригласить участника',
    removeFromChat: 'Удалить из чата',
    fileAttached: 'Прикреплен файл',
    
    // Users
    unknownUser: 'Неизвестный пользователь',
    userNotFound: 'Пользователь не найден',
    
    // Files and attachments
    attachments: 'Вложения',
    addFile: 'Добавить файл',
    filesUploaded: 'Файлы загружены',
    fileDeleted: 'Файл удален',
    uploadFailed: 'Ошибка загрузки',
    downloadFailed: 'Ошибка скачивания',
    deleteFailed: 'Ошибка удаления',
    unsupportedFileType: 'Неподдерживаемый тип файла',
    fileTooLarge: 'Файл слишком большой',
    
    // Comments
    comments: 'Комментарии',
    noComments: 'Нет комментариев',
    writeComment: 'Написать комментарий...',
    commentAdded: 'Комментарий добавлен',
    commentFailed: 'Ошибка добавления комментария',
    pressCtrlEnter: 'Ctrl+Enter для отправки',
    
    // Participants
    participants: 'Участники',
    noParticipants: 'Нет участников',
    addParticipant: 'Добавить участника',
    participantAdded: 'Участник добавлен',
    participantRemoved: 'Участник удален',
    addParticipantFailed: 'Ошибка добавления участника',
    removeParticipantFailed: 'Ошибка удаления участника',
    
    // Navigation
    dashboard: 'Главная',
    tasks: 'Задачи',
    team: 'Команда',
    projects: 'Проекты',
    issues: 'Проблемы',
    awards: 'Награды',
    analytics: 'Аналитика',
    admin: 'Админ',
    logout: 'Выйти',

    // Team page
    teamManagement: 'Управление командой',
    addEmployee: 'Добавить сотрудника',
    loadingTeam: 'Загрузка команды...',
    dataLoadError: 'Ошибка загрузки данных',
    tryAgain: 'Попробовать снова',
    employee: 'Сотрудник',
    department: 'Отдел',
    since: 'С',
    status: 'Статус',
    noTeamMembers: 'Нет участников команды. Добавьте первого сотрудника.',
    administrator: 'Администратор',
    manager: 'Менеджер',
    intern: 'Стажер',
    unknown: 'Неизвестно',
    away: 'Отошел',
    offline: 'Не в сети',

    // Index page
    goingToTasks: 'Переход к задачам',
    openingTasksList: 'Открываем список активных задач...',
    goingToTeam: 'Переход к команде',
    openingTeamManagement: 'Открываем управление командой...',
    goingToAchievements: 'Переход к достижениям',
    openingAchievements: 'Открываем награды и достижения...',
    personalTasksDesc: 'Управление личными задачами',
    teamDesc: 'Команда и сотрудники',
    projectsDesc: 'Активные проекты',
    analyticsDesc: 'Аналитика и отчеты',
    problemsDesc: 'Проблемы требующие внимания',
    achievementsDesc: 'Награды и достижения',
    adminDesc: 'Управление системой и внешний контроль',
    perWeek: 'за неделю',
    active: 'Активных',
    users: 'пользователей',
    aiAssistantDesc: 'Персональный помощник для создания задач с учетом навыков каждого сотрудника',
    personalization: 'Персонализация',
    smartTasks: 'Умные задачи',
    loadAnalysis: 'Анализ нагрузки',
    
    // Tasks
    tasksTitle: 'Управление задачами',
    tasksDescription: 'Создавайте и отслеживайте задачи для команды',
    allTasks: 'Все задачи',
    myTasks: 'Мои задачи',
    createdByMe: 'Созданные мной',
    taskStatus: 'Статус',
    taskPriority: 'Приоритет',
    searchTasks: 'Поиск задач...',
    createTask: 'Создать задачу',
    startWork: 'Начать работу',
    complete: 'Завершить',
    assignee: 'Исполнитель',
    dueDate: 'До',
    estimated: 'Планируемо',
    actual: 'Фактически',
    hours: 'ч',
    created: 'Создана',
    noTasksFound: 'Задач не найдено',
    noTasksFoundDesc: 'Создайте первую задачу или измените фильтры поиска',
    noActiveTasks: 'У вас нет активных задач',
    noActiveTasksDesc: 'Задачи, назначенные на вас, будут отображаться здесь',
    noCreatedTasks: 'Вы еще не создали ни одной задачи',
    noCreatedTasksDesc: 'Нажмите "Создать задачу" чтобы начать',
    
    // Task Status
    pending: 'Ожидает',
    inProgress: 'В работе',
    completed: 'Завершена',
    cancelled: 'Отменена',
    onHold: 'Приостановлена',
    
    // Task Priority
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критический',
    
    // Statuses
    allStatuses: 'Все статусы',
    allPriorities: 'Все приоритеты',
    
    // Messages
    taskStatusUpdated: 'Статус задачи обновлен',
    taskStatusUpdateError: 'Не удалось обновить статус задачи',
    tasksLoadError: 'Не удалось загрузить задачи',
    // Strategic Banner
    strategicLoadingTitle: 'Загрузка стратегии…',
    strategicLoadingDesc: 'Получаем цель и ключевые результаты',
    strategicFocusTitle: 'Стратегический фокус',
    strategicNotFound: 'Стратегическая цель не найдена',
    strategicStatus: 'Статус',
    strategicBudgetPlanned: 'Плановый бюджет',
    strategicProgress: 'Прогресс',
    strategicTarget: 'Цель',
    strategicCurrent: 'Текущее',
    location: 'Локация',
    targetDate: 'Целевая дата',
    statusPlanned: 'Запланирована',
    statusActive: 'Активна',
    statusDone: 'Завершена',
    statusOnHold: 'Приостановлена',

    // Auth
    authTitle: 'Авторизация',
    authDesc: 'Войдите в систему или создайте новый аккаунт',
    signIn: 'Вход',
    signUp: 'Регистрация',
    email: 'Email',
    password: 'Пароль',
    fullName: 'Полное имя',
    position: 'Должность',
    phone: 'Телефон',
    telegram: 'Telegram',
    signInCta: 'Войти',
    signingIn: 'Вход...',
    signUpCta: 'Зарегистрироваться',
    signingUp: 'Регистрация...',
    selectDepartment: 'Выберите подразделение',
    loginSuccessTitle: 'Успешный вход',
    loginSuccessDesc: 'Добро пожаловать в Tiger CRM!',
    loginErrorTitle: 'Ошибка входа',
    loginInvalidCredentials: 'Неверный email или пароль',
    loginEmailNotConfirmed: 'Подтвердите email перед входом',
    signupSuccessTitle: 'Регистрация успешна!',
    signupSuccessDesc: 'Проверьте email для подтверждения аккаунта',
    signupErrorTitle: 'Ошибка регистрации',
    signupUserExists: 'Пользователь с таким email уже существует',
    signupWeakPassword: 'Пароль слишком слабый. Минимум 6 символов',

    // Department options
    depManagement: 'Управление',
    depMarketing: 'Маркетинг',
    depExpertise: 'Экспертиза',
    depProduction: 'Производство',
    depLeadership: 'Руководство',
    depIT: 'IT',
    depConsulting: 'Консультации',

    // Online Users
    onlineUsersTitle: 'Пользователи онлайн',
    activeUsersInSystem: 'Активные пользователи в системе',
    noActiveUsers: 'Нет активных пользователей',
    moreUsersOnlinePrefix: '+',
    moreUsersOnlineSuffix: ' больше пользователей онлайн',

    // Smart AI Sidebar
    smartAISidebar: 'Умный AI Сайдбар',
    taskSummary: 'Краткое описание задачи',
    riskAnalysis: 'Анализ рисков',
    recommendedActions: 'Рекомендуемые действия',
    taskIntelligence: 'Интеллект задачи',
    complexity: 'Сложность',
    timeEstimation: 'Оценка времени',
    aiTags: 'Теги',
    aiActions: 'AI Действия',
    generateSummary: 'Создать резюме',
    suggestSubtasks: 'Предложить подзадачи',
    findExperts: 'Найти экспертов',
    riskLevel: 'Уровень риска',
    riskHigh: 'Высокий',
    riskMedium: 'Средний',
    riskLow: 'Низкий',
    riskCritical: 'Критический',
    noTaskSelected: 'Задача не выбрана',
    selectTaskToSeeInsights: 'Выберите задачу для получения AI аналитики',
    // Analytics and Reports
    exportReport: 'Экспорт отчета',
    period: 'Период',
    analyticsDepartment: 'Отдел',
    allDepartments: 'Все отделы',
    weekPerformance: 'Производительность по неделям',
    departmentPerformance: 'Производительность отделов',
    topPerformers: 'Лучшие исполнители',
    efficiency: 'Эффективность',
    lastDays: 'Последние 7 дней',
    lastMonth: 'Последние 30 дней',
    last3Months: 'Последние 3 месяца',
    lastYear: 'Последний год',
    overdue: 'Просрочено',
    
    // Production & UAV Dashboard
    production: 'Производство',
    productionKanban: 'Производственный Канбан',
    uavDashboard: 'UAV Панель',
    missionControl: 'Центр управления',
    serialNumber: 'Серийный номер',
    model: 'Модель',
    stage: 'Этап',
    progress: 'Прогресс',
    assignedTo: 'Назначен',
    estimatedCompletion: 'Оценочное завершение',
    priority: 'Приоритет',
    normal: 'Обычный',
    urgent: 'Срочный',
    incoming: 'Поступивший',
    mechanical: 'Механика',
    electronics: 'Электроника',
    assembly: 'Сборка',
    testing: 'Тестирование',
    packaging: 'Упаковка',
    hoursUnit: 'часа',
    minutes: 'минут',
    systemHealth: 'Состояние системы',
    operational: 'Операционный',
    maintenance: 'Техобслуживание',
    documents: 'Документооборот',
    maintenanceCenter: 'Центр техобслуживания',
    documentCenter: 'Центр документооборота',
    integrations: 'Интеграции',
    systemStats: 'Статистика системы',
    totalUsers: 'Всего пользователей',
    totalTasks: 'Всего задач',
    apiStatus: 'API статус',
    database: 'База данных',
    recentTasks: 'Последние задачи',
    quickActions: 'Быстрые действия',
    optimizeDB: 'Оптимизировать БД',
    userManagement: 'Управление пользователями',
    exportReports: 'Экспорт отчётов',
    systemSettings: 'Системные настройки',
    adminPanel: 'Панель администрирования системы',
    adminKey: 'Admin ключ',
    enterAdminKey: 'Введите admin ключ',
    checking: 'Проверка...',
    loginToAdmin: 'Войти в админ панель',
    systemAdministration: 'Системное администрирование и мониторинг',
    adminModeActive: 'Режим администратора активен',
    fullAccess: 'Полный доступ к системным функциям и управлению',
    mainMenu: 'Главное меню',
    update: 'Обновить',
    backup: 'Бэкап',
    backupCreated: 'Бэкап создан',
    fileDownloaded: 'Файл загружен на ваш компьютер',
    requestCompleted: 'Запрос выполнен',
    recordsReceived: 'записей получено',
    taskCreatedViaAPI: 'Задача создана через API',
    enterTaskName: 'Введите название задачи',
    authError: 'Ошибка аутентификации',
    invalidAdminKey: 'Неверный admin ключ',
    allTime: 'За всё время',
    activeProfiles: 'Активных профилей',

    // UAV Dashboard
    operationalCenter: 'Операционный центр управления',
    uavSystem: 'Система управления UAV миссиями и производством',
    welcomeUser: 'Добро пожаловать',
    systems: 'Системы',
    ready: 'ГОТОВ',
    launchMission: 'Запустить миссию',
    strategicGoal: 'Стратегическая цель',
    increaseCapacity: 'Увеличение производственной мощности до 100 единиц/месяц',
    onTrack: 'НА ПУТИ',
    completion: 'выполнения',
    monthlyGrowth: '+12% за месяц',
    productionUnit: 'Производство',
    qualityLabel: 'Качество',
    deadlineLabel: 'Дедлайн',
    activeMissionsLabel: 'Активные миссии',
    productionConveyor: 'Производственный конвейер',
    technicalStatus: 'Техническое состояние',
    teamOnline: 'Команда онлайн',
    unitsInFlight: 'Беспилотники в полете',
    unitsInProduction: 'Единиц в производстве',
    systemHealthStatus: 'Исправность системы',
    operatorsOnline: 'Операторов в сети',
    systemStatusLabel: 'Системный статус',
    databaseLabel: 'БД',
    temperatureLabel: 'Темп',
    batteryLabel: 'Батарея',
    communicationLabel: 'Связь',
    lastUpdateLabel: 'Последнее обновление',
    quickActionsLabel: 'Быстрые действия',
    tasksLabel: 'Задачи',
    analyticsLabel: 'Аналитика',
    problemsLabel: 'Проблемы',
    
    // Mission Control
    missionControlTitle: 'Центр управления миссиями',
    missionControlCenter: 'Центр управления UAV миссиями',
    weatherConditions: 'Погодные условия',
    windLabel: 'Ветер',
    visibilityLabel: 'Видимость',
    gpsSignalLabel: 'GPS сигнал',
    excellentLabel: 'Отличный',
    activeMissionsTitle: 'Активные миссии',
    waypointsLabel: 'Точки маршрута',
    altitudeLabel: 'Высота',
    flightTimeLabel: 'Время в полете',
    progressLabel: 'Прогресс',
    mapLabel: 'Карта',
    detailsLabel: 'Детали',
    fleetStatusLabel: 'Состояние флота',
    tacticalMapLabel: 'Тактическая карта',
    mapboxIntegrationLabel: 'Интеграция с картографическим сервисом',
    armedStatus: 'ВООРУЖЕН',
    inFlightStatus: 'В ПОЛЕТЕ',
    planningStatus: 'ПЛАНИРОВАНИЕ',
    completedStatus: 'ЗАВЕРШЕН',
    abortedStatus: 'ПРЕРВАН',
    warningStatus: 'ПРЕДУПРЕЖДЕНИЕ',
    criticalStatus: 'КРИТИЧНО',
    lowStatus: 'НИЗКО',
    highStatus: 'ВЫСОКАЯ',
    
    // Analytics
    analyticsTitle: 'Аналитика',
    performanceAnalysisDesc: 'Анализ производительности и метрики команды',
    exportReportLabel: 'Экспорт отчета',
    periodLabel: 'Период',
    departmentLabel: 'Отдел',
    allDepartmentsLabel: 'Все отделы',
    last7DaysLabel: 'Последние 7 дней',
    last30DaysLabel: 'Последние 30 дней',
    last3MonthsLabel: 'Последние 3 месяца',
    lastYearLabel: 'Последний год',
    completedTasksLabel: 'Выполненных задач',
    activeEmployeesLabel: 'Активных сотрудников',
    averageTimeLabel: 'Среднее время',
    achievementsLabel: 'Достижений',
    forPeriodLabel: 'за период',
    weeklyPerformanceLabel: 'Производительность по неделям',
    plannedVsCompletedLabel: 'Сравнение запланированных и выполненных задач',
    departmentPerformanceLabel: 'Производительность отделов',
    tasksAndEfficiencyLabel: 'Задачи и эффективность по отделам',
    topPerformersLabel: 'Лучшие исполнители',
    tasksCompletedLabel: 'задач выполнено',
    efficiencyLabel: 'эффективность',
    
    // Issues
    issuesTitle: 'Проблемы',
    issueTrackingDesc: 'Система отслеживания проблем и ошибок',
    createIssueLabel: 'Создать проблему',
    searchIssuesPlaceholder: 'Поиск проблем...',
    statusLabel: 'Статус',
    priorityLabel: 'Приоритет',
    allStatusesLabel: 'Все статусы',
    openStatus: 'Открыта',
    inProgressStatus: 'В работе',
    resolvedStatus: 'Решена',
    closedStatus: 'Закрыта',
    allPrioritiesLabel: 'Все приоритеты',
    taskLabel: 'Задача',
    createdByLabel: 'Создал',
    assignedToLabel: 'Назначено',
    createdDateLabel: 'Создано',
    noIssuesFoundLabel: 'Проблемы не найдены по заданным критериям',
    noIssuesYetLabel: 'Нет открытых проблем. Создайте первую проблему для отслеживания.',
    
    // Awards
    awardsTitle: 'Награды и достижения',
    motivationSystemDesc: 'Система мотивации и признания заслуг',
    createAwardLabel: 'Создать награду',
    totalAchievementsLabel: 'Всего достижений',
    awardsTodayLabel: 'Награждений сегодня',
    overallRatingLabel: 'Общий рейтинг',
    activeParticipantsLabel: 'Активных участников',
    availableAchievementsLabel: 'Доступные достижения',
    searchAchievementsPlaceholder: 'Поиск достижений...',
    categoryLabel: 'Категория',
    allCategoriesLabel: 'Все категории',
    starterCategory: 'Начинающий',
    productivityCategory: 'Продуктивность',
    teamworkCategory: 'Командная работа',
    milestoneCategory: 'Веха',
    noAchievementsCreatedLabel: 'Достижения пока не созданы',
    createFirstAchievementLabel: 'Создайте первое достижение для мотивации команды!',
    recentAwardsLabel: 'Последние награждения',
    noAwardsYetLabel: 'Пока нет награждений',
    awardsWillAppearLabel: 'Награждения будут отображаться здесь после их создания',
    leaderboardLabel: 'Таблица лидеров',
    pointsLabel: 'очков',
    
    // Team
    teamManagementDesc: 'Управление участниками команды',
    addEmployeeLabel: 'Добавить сотрудника',
    loadingTeamLabel: 'Загрузка команды...',
    dataLoadErrorLabel: 'Ошибка загрузки данных',
    tryAgainLabel: 'Попробовать снова',
    noTeamMembersLabel: 'Нет участников команды. Добавьте первого сотрудника.',
    sinceLabel: 'С',
    editLabel: 'Изм.',
    roleLabel: 'Роль',
    cancelLabel: 'Отмена',
    saveLabel: 'Сохранить',
  },
  
  bg: {
    // Common
    loading: 'Зареждане...',
    error: 'Грешка',
    success: 'Успешно',
    save: 'Запази',
    cancel: 'Отказ',
    delete: 'Изтрий',
    edit: 'Редактирай',
    create: 'Създай',
    search: 'Търсене',
    filter: 'Филтър',
    send: 'Изпрати',
    sending: 'Изпращане...',
    uploading: 'Качване...',
    edited: 'редактирано',
    joined: 'се присъедини',
    
    // Main page
    title: 'TIGER CRM',
    subtitle: 'Система за управление на задачи и проекти',
    welcome: 'Добре дошли',
    welcomeDescription: 'Вашата цялостна система за управление на задачи и проекти',
    systemStatus: 'Състояние на системата',
    online: 'Онлайн',
    performance: 'Производителност',
    activeTasks: 'Активни задачи',
    teamMembers: 'Членове на екипа',
    achievements: 'Постижения',
    problems: 'Проблеми',
    achievements_page: 'Награди',
    lastUpdate: 'Последна актуализация',
    aiAssistant: 'AI Асистент',

    // AI Assistant
    aiAssistantReadyTitle: 'AI анализът е готов',
    aiAssistantReadyDesc: 'Получен е отговор от Tiger AI',
    aiErrorTitle: 'AI Грешка',
    aiErrorDesc: 'Неуспешно получаване на отговор от AI',
    aiMessageRequired: 'Въведете съобщение за AI асистента',
    aiEmployeeRequired: 'Изберете служител',
    aiProcessing: 'AI обработва...',
    aiRequest: 'Попитай Tiger AI',
    aiModeLabel: 'Режим на AI асистента',
    aiModePlaceholder: 'Изберете режим',
    aiEmployeePlaceholder: 'Изберете служител',
    aiTaskDescriptionLabel: 'Описание на задачата',
    aiMessageLabel: 'Съобщение за AI',
    aiPlaceholderCreateTask: 'Опишете задачата свободно. AI ще създаде персонализирана задача според уменията на служителя...',
    aiPlaceholderSuggestOptimization: 'Опишете проблем или област за оптимизация...',
    aiPlaceholderChat: 'Задайте въпрос относно управлението на задачи...',
    aiResponseTitle: 'Отговор от Tiger AI',
    aiBadgeTask: 'Задача',
    aiBadgeAnalysis: 'Анализ',
    aiBadgeOptimization: 'Оптимизация',
    aiBadgeChat: 'Чат',
    aiTaskName: 'Име на задачата:',
    aiDescription: 'Описание:',
    aiPriority: 'Приоритет',
    aiTime: 'Време',
    smartAITags: 'Етикети:',
    aiRecommendations: 'Препоръки:',
    aiWorkloadStatus: 'Състояние на натоварването:',
    aiAnalysis: 'Анализ:',
    aiOptimizations: 'Оптимизации:',
    aiSkillDevelopment: 'Развитие на умения:',
    aiAnswer: 'Отговор:',
    aiModeCreateTask: 'Създай задача',
    aiModeAnalyzeWorkload: 'Анализ на натоварването',
    aiModeSuggestOptimization: 'Предложения за оптимизация',
    aiModeChat: 'Свободен чат',
    aiCapabilitiesPersonalized: 'Персонализирани задачи',
    aiCapabilitiesWorkload: 'Анализ на натоварването',
    aiCapabilitiesOptimization: 'Оптимизация на процеси',
    aiCapabilitiesChat: 'Свободен диалог',
    aiTipTitle: 'Съвет от Tiger AI',
    aiTipText: 'Опишете задачата свободно и AI ще създаде персонализирано задание, отчитайки уменията и натоварването.',
    taskCreatedTitle: 'Задачата е създадена!',
    taskAssigned: 'Възложена на служител',
    taskCreationError: 'Неуспешно създаване на задача',
    
    // Notifications
    notifications: 'Известия',
    noNotifications: 'Няма известия',
    markAsRead: 'Маркирай като прочетено',
    markAllAsRead: 'Маркирай всички като прочетени',
    invitedToTask: 'Покана за задача',
    acceptInvitation: 'Приеми',
    declineInvitation: 'Откажи',
    invitationAccepted: 'Поканата е приета',
    invitationDeclined: 'Поканата е отказана',
    
    // Chat and invitations
    inviteToChat: 'Покани в чат',
    chatInvitation: 'Покана за чат на задача',
    inviteParticipant: 'Покани участник',
    removeFromChat: 'Премахни от чата',
    fileAttached: 'Прикачен файл',
    
    // Users
    unknownUser: 'Неизвестен потребител',
    userNotFound: 'Потребителят не е намерен',
    
    // Files and attachments
    attachments: 'Прикачени файлове',
    addFile: 'Добави файл',
    filesUploaded: 'Файловете са качени',
    fileDeleted: 'Файлът е изтрит',
    uploadFailed: 'Грешка при качване',
    downloadFailed: 'Грешка при изтегляне',
    deleteFailed: 'Грешка при изтриване',
    unsupportedFileType: 'Неподдържан тип файл',
    fileTooLarge: 'Файлът е твърде голям',
    
    // Comments
    comments: 'Коментари',
    noComments: 'Няма коментари',
    writeComment: 'Напиши коментар...',
    commentAdded: 'Коментарът е добавен',
    commentFailed: 'Грешка при добавяне на коментар',
    pressCtrlEnter: 'Ctrl+Enter за изпращане',
    
    // Participants
    participants: 'Участници',
    noParticipants: 'Няма участници',
    addParticipant: 'Добави участник',
    participantAdded: 'Участникът е добавен',
    participantRemoved: 'Участникът е премахнат',
    addParticipantFailed: 'Грешка при добавяне на участник',
    removeParticipantFailed: 'Грешка при премахване на участник',
    
    // Navigation
    dashboard: 'Начало',
    tasks: 'Задачи',
    team: 'Екип',
    projects: 'Проекти',
    issues: 'Проблеми',
    awards: 'Награди',
    analytics: 'Анализи',
    admin: 'Админ',
    logout: 'Изход',

    // Team page
    teamManagement: 'Управление на екипа',
    addEmployee: 'Добави служител',
    loadingTeam: 'Зареждане на екипа...',
    dataLoadError: 'Грешка при зареждане на данни',
    tryAgain: 'Опитай пак',
    employee: 'Служител',
    department: 'Отдел',
    since: 'От',
    status: 'Статус',
    noTeamMembers: 'Няма членове на екипа. Добавете първия служител.',
    administrator: 'Администратор',
    manager: 'Мениджър',
    intern: 'Стажант',
    unknown: 'Неизвестно',
    away: 'Отсъства',
    offline: 'Офлайн',

    // Index page
    goingToTasks: 'Отиваме към задачите',
    openingTasksList: 'Отваряме списъка със задачи...',
    goingToTeam: 'Отиваме към екипа',
    openingTeamManagement: 'Отваряме управлението на екипа...',
    goingToAchievements: 'Отиваме към постиженията',
    openingAchievements: 'Отваряме наградите и постиженията...',
    personalTasksDesc: 'Управление на лични задачи',
    teamDesc: 'Екип и служители',
    projectsDesc: 'Активни проекти',
    analyticsDesc: 'Аналитика и отчети',
    problemsDesc: 'Проблеми изискващи внимание',
    achievementsDesc: 'Награди и постижения',
    adminDesc: 'Системно управление и външен контрол',
    perWeek: 'за седмица',
    active: 'Активни',
    users: 'потребители',
    aiAssistantDesc: 'Личен асистент за създаване на задачи с отчитане на уменията на всеки служител',
    personalization: 'Персонализация',
    smartTasks: 'Умни задачи',
    loadAnalysis: 'Анализ на натоварването',
    
    // Tasks
    tasksTitle: 'Управление на задачи',
    tasksDescription: 'Създавайте и следете задачи за екипа',
    allTasks: 'Всички задачи',
    myTasks: 'Моите задачи',
    createdByMe: 'Създадени от мен',
    taskStatus: 'Статус',
    taskPriority: 'Приоритет',
    searchTasks: 'Търсене на задачи...',
    createTask: 'Създай задача',
    startWork: 'Започни работа',
    complete: 'Завърши',
    assignee: 'Изпълнител',
    dueDate: 'До',
    estimated: 'Планирано',
    actual: 'Действително',
    hours: 'ч',
    created: 'Създадена',
    noTasksFound: 'Няма намерени задачи',
    noTasksFoundDesc: 'Създайте първата задача или променете филтрите за търсене',
    noActiveTasks: 'Нямате активни задачи',
    noActiveTasksDesc: 'Задачите, възложени на вас, ще се показват тук',
    noCreatedTasks: 'Още не сте създали нито една задача',
    noCreatedTasksDesc: 'Натиснете "Създай задача" за да започнете',
    
    // Task Status
    pending: 'Чакащ',
    inProgress: 'В процес',
    completed: 'Завършена',
    cancelled: 'Отменена',
    onHold: 'На пауза',
    
    // Task Priority
    low: 'Нисък',
    medium: 'Среден',
    high: 'Висок',
    critical: 'Критичен',
    
    // Statuses
    allStatuses: 'Всички статуси',
    allPriorities: 'Всички приоритети',
    
    // Messages
    taskStatusUpdated: 'Статусът на задачата е актуализиран',
    taskStatusUpdateError: 'Неуспешно актуализиране на статуса на задачата',
    tasksLoadError: 'Неуспешно зареждане на задачите',
    // Strategic Banner
    strategicLoadingTitle: 'Зареждане на стратегия…',
    strategicLoadingDesc: 'Получаваме цел и ключови резултати',
    strategicFocusTitle: 'Стратегически фокус',
    strategicNotFound: 'Стратегическата цел не е намерена',
    strategicStatus: 'Статус',
    strategicBudgetPlanned: 'Планиран бюджет',
    strategicProgress: 'Прогрес',
    strategicTarget: 'Цел',
    strategicCurrent: 'Текущо',
    location: 'Локация',
    targetDate: 'Целева дата',
    statusPlanned: 'Планирана',
    statusActive: 'Активна',
    statusDone: 'Завършена',
    statusOnHold: 'На пауза',

    // Auth
    authTitle: 'Вход',
    authDesc: 'Влезте в системата или създайте нов акаунт',
    signIn: 'Вход',
    signUp: 'Регистрация',
    email: 'Email',
    password: 'Парола',
    fullName: 'Пълно име',
    position: 'Длъжност',
    phone: 'Телефон',
    telegram: 'Telegram',
    signInCta: 'Вход',
    signingIn: 'Влизане...',
    signUpCta: 'Създай акаунт',
    signingUp: 'Регистрация...',
    selectDepartment: 'Изберете отдел',
    loginSuccessTitle: 'Успешен вход',
    loginSuccessDesc: 'Добре дошли в Tiger CRM!',
    loginErrorTitle: 'Грешка при вход',
    loginInvalidCredentials: 'Невалиден email или парола',
    loginEmailNotConfirmed: 'Моля, потвърдете email преди вход',
    signupSuccessTitle: 'Регистрацията е успешна!',
    signupSuccessDesc: 'Проверете email за потвърждение на акаунта',
    signupErrorTitle: 'Грешка при регистрация',
    signupUserExists: 'Потребител с този email вече съществува',
    signupWeakPassword: 'Слаба парола. Минимум 6 символа',

    // Department options
    depManagement: 'Управление',
    depMarketing: 'Маркетинг',
    depExpertise: 'Експертиза',
    depProduction: 'Производство',
    depLeadership: 'Ръководство',
    depIT: 'IT',
    depConsulting: 'Консултации',

    // Online Users
    onlineUsersTitle: 'Потребители онлайн',
    activeUsersInSystem: 'Активни потребители в системата',
    noActiveUsers: 'Няма активни потребители',
    moreUsersOnlinePrefix: '+',
    moreUsersOnlineSuffix: ' още потребители онлайн',

    // Smart AI Sidebar
    smartAISidebar: 'Умен AI Странична лента',
    taskSummary: 'Резюме на задачата',
    riskAnalysis: 'Анализ на риска',
    recommendedActions: 'Препоръчани действия',
    taskIntelligence: 'Интелигентност на задачата',
    complexity: 'Сложност',
    timeEstimation: 'Оценка на времето',
    aiTags: 'Етикети',
    aiActions: 'AI Действия',
    generateSummary: 'Генерирай резюме',
    suggestSubtasks: 'Предложи подзадачи',
    findExperts: 'Намери експерти',
    riskLevel: 'Ниво на риска',
    riskHigh: 'Високо',
    riskMedium: 'Средно',
    riskLow: 'Ниско',
    riskCritical: 'Критично',
    noTaskSelected: 'Няма избрана задача',
    selectTaskToSeeInsights: 'Изберете задача за AI анализ',
    // Analytics and Reports
    exportReport: 'Експорт на отчет',
    period: 'Период',
    analyticsDepartment: 'Отдел',
    allDepartments: 'Всички отдели',
    weekPerformance: 'Седмична производителност',
    departmentPerformance: 'Производителност по отдели',
    topPerformers: 'Най-добри изпълнители',
    efficiency: 'Ефективност',
    lastDays: 'Последните 7 дни',
    lastMonth: 'Последните 30 дни',
    last3Months: 'Последните 3 месеца',
    lastYear: 'Последната година',
    overdue: 'Просрочени',
    
    // Production & UAV Dashboard
    production: 'Производство',
    productionKanban: 'Производствен Канбан',
    uavDashboard: 'UAV Табло',
    missionControl: 'Център за управление',
    serialNumber: 'Сериен номер',
    model: 'Модел',
    stage: 'Етап',
    progress: 'Прогрес',
    assignedTo: 'Назначен на',
    estimatedCompletion: 'Очаквано завършване',
    priority: 'Приоритет',
    normal: 'Нормален',
    urgent: 'Спешно',
    incoming: 'Постъпил',
    mechanical: 'Механика',
    electronics: 'Електроника',
    assembly: 'Сглобяване',
    testing: 'Тестване',
    packaging: 'Опаковане',
    hoursUnit: 'часа',
    minutes: 'минути',
    systemHealth: 'Състояние на системата',
    operational: 'Оперативен',
    maintenance: 'Поддръжка',
    documents: 'Документооборот',
    maintenanceCenter: 'Център за поддръжка',
    documentCenter: 'Център за документооборот',
    integrations: 'Интеграции',
    systemStats: 'Статистика на системата',
    totalUsers: 'Общо потребители',
    totalTasks: 'Общо задачи',
    apiStatus: 'API статус',
    database: 'База данни',
    recentTasks: 'Последни задачи',
    quickActions: 'Бързи действия',
    optimizeDB: 'Оптимизирай БД',
    userManagement: 'Управление на потребители',
    exportReports: 'Експорт на отчети',
    systemSettings: 'Системни настройки',
    adminPanel: 'Панел за администриране на системата',
    adminKey: 'Admin ключ',
    enterAdminKey: 'Въведете admin ключ',
    checking: 'Проверка...',
    loginToAdmin: 'Влез в админ панела',
    systemAdministration: 'Системно администриране и мониторинг',
    adminModeActive: 'Режим администратор активен',
    fullAccess: 'Пълен достъп до системни функции и управление',
    mainMenu: 'Главно меню',
    update: 'Обнови',
    backup: 'Резервно копие',
    backupCreated: 'Резервно копие създадено',
    fileDownloaded: 'Файлът е изтеглен на вашия компютър',
    requestCompleted: 'Заявката е изпълнена',
    recordsReceived: 'записа получени',
    taskCreatedViaAPI: 'Задачата е създадена чрез API',
    enterTaskName: 'Въведете име на задачата',
    authError: 'Грешка при удостоверяване',
    invalidAdminKey: 'Невалиден admin ключ',
    allTime: 'За цялото време',
    activeProfiles: 'Активни профили',

    // UAV Dashboard
    operationalCenter: 'Операционен център за управление',
    uavSystem: 'Система за управление на UAV мисии и производство',
    welcomeUser: 'Добре дошли',
    systems: 'Системи',
    ready: 'ГОТОВ',
    launchMission: 'Стартирай мисия',
    strategicGoal: 'Стратегическа цел',
    increaseCapacity: 'Увеличаване на производствения капацитет до 100 единици/месец',
    onTrack: 'НА ПЪТЯ',
    completion: 'завършеност',
    monthlyGrowth: '+12% за месец',
    productionUnit: 'Производство',
    qualityLabel: 'Качество',
    deadlineLabel: 'Краен срок',
    activeMissionsLabel: 'Активни мисии',
    productionConveyor: 'Производствена лента',
    technicalStatus: 'Техническо състояние',
    teamOnline: 'Екип онлайн',
    unitsInFlight: 'Дронове в полет',
    unitsInProduction: 'Единици в производство',
    systemHealthStatus: 'Здраве на системата',
    operatorsOnline: 'Оператори онлайн',
    systemStatusLabel: 'Системен статус',
    databaseLabel: 'БД',
    temperatureLabel: 'Темп',
    batteryLabel: 'Батерия',
    communicationLabel: 'Връзка',
    lastUpdateLabel: 'Последна актуализация',
    quickActionsLabel: 'Бързи действия',
    tasksLabel: 'Задачи',
    analyticsLabel: 'Аналитика',
    problemsLabel: 'Проблеми',
    
    // Mission Control
    missionControlTitle: 'Център за управление на мисии',
    missionControlCenter: 'Център за управление на UAV мисии',
    weatherConditions: 'Метеорологични условия',
    windLabel: 'Вятър',
    visibilityLabel: 'Видимост',
    gpsSignalLabel: 'GPS сигнал',
    excellentLabel: 'Отличен',
    activeMissionsTitle: 'Активни мисии',
    waypointsLabel: 'Точки от маршрута',
    altitudeLabel: 'Височина',
    flightTimeLabel: 'Време в полет',
    progressLabel: 'Прогрес',
    mapLabel: 'Карта',
    detailsLabel: 'Детайли',
    fleetStatusLabel: 'Състояние на флота',
    tacticalMapLabel: 'Тактическа карта',
    mapboxIntegrationLabel: 'Интеграция с картографска услуга',
    armedStatus: 'ВЪОРЪЖЕН',
    inFlightStatus: 'В ПОЛЕТ',
    planningStatus: 'ПЛАНИРАНЕ',
    completedStatus: 'ЗАВЪРШЕН',
    abortedStatus: 'ПРЕКРАТЕН',
    warningStatus: 'ПРЕДУПРЕЖДЕНИЕ',
    criticalStatus: 'КРИТИЧНО',
    lowStatus: 'НИСКО',
    highStatus: 'ВИСОКО',
    
    // Analytics
    analyticsTitle: 'Аналитика',
    performanceAnalysisDesc: 'Анализ на производителността и метрики на екипа',
    exportReportLabel: 'Експорт на отчет',
    periodLabel: 'Период',
    departmentLabel: 'Отдел',
    allDepartmentsLabel: 'Всички отдели',
    last7DaysLabel: 'Последните 7 дни',
    last30DaysLabel: 'Последните 30 дни',
    last3MonthsLabel: 'Последните 3 месеца',
    lastYearLabel: 'Последната година',
    completedTasksLabel: 'Завършени задачи',
    activeEmployeesLabel: 'Активни служители',
    averageTimeLabel: 'Средно време',
    achievementsLabel: 'Постижения',
    forPeriodLabel: 'за период',
    weeklyPerformanceLabel: 'Седмична производителност',
    plannedVsCompletedLabel: 'Планирани срещу завършени задачи',
    departmentPerformanceLabel: 'Производителност на отделите',
    tasksAndEfficiencyLabel: 'Задачи и ефективност по отдели',
    topPerformersLabel: 'Най-добри изпълнители',
    tasksCompletedLabel: 'задачи завършени',
    efficiencyLabel: 'ефективност',
    
    // Issues
    issuesTitle: 'Проблеми',
    issueTrackingDesc: 'Система за проследяване на проблеми и грешки',
    createIssueLabel: 'Създай проблем',
    searchIssuesPlaceholder: 'Търсене на проблеми...',
    statusLabel: 'Статус',
    priorityLabel: 'Приоритет',
    allStatusesLabel: 'Всички статуси',
    openStatus: 'Отворен',
    inProgressStatus: 'В работа',
    resolvedStatus: 'Решен',
    closedStatus: 'Затворен',
    allPrioritiesLabel: 'Всички приоритети',
    taskLabel: 'Задача',
    createdByLabel: 'Създаден от',
    assignedToLabel: 'Възложен на',
    createdDateLabel: 'Създаден',
    noIssuesFoundLabel: 'Не са намерени проблеми по зададените критерии',
    noIssuesYetLabel: 'Няма отворени проблеми. Създайте първия проблем за проследяване.',
    
    // Awards
    awardsTitle: 'Награди и постижения',
    motivationSystemDesc: 'Система за мотивация и признаване на заслуги',
    createAwardLabel: 'Създай награда',
    totalAchievementsLabel: 'Общо постижения',
    awardsTodayLabel: 'Награди днес',
    overallRatingLabel: 'Общ рейтинг',
    activeParticipantsLabel: 'Активни участници',
    availableAchievementsLabel: 'Налични постижения',
    searchAchievementsPlaceholder: 'Търсене на постижения...',
    categoryLabel: 'Категория',
    allCategoriesLabel: 'Всички категории',
    starterCategory: 'Начинаещ',
    productivityCategory: 'Продуктивност',
    teamworkCategory: 'Екипна работа',
    milestoneCategory: 'Етап',
    noAchievementsCreatedLabel: 'Все още не са създадени постижения',
    createFirstAchievementLabel: 'Създайте първото постижение за мотивация на екипа!',
    recentAwardsLabel: 'Последни награди',
    noAwardsYetLabel: 'Все още няма награди',
    awardsWillAppearLabel: 'Наградите ще се появят тук след създаването им',
    leaderboardLabel: 'Класация',
    pointsLabel: 'точки',
    
    // Team
    teamManagementDesc: 'Управление на членовете на екипа',
    addEmployeeLabel: 'Добави служител',
    loadingTeamLabel: 'Зареждане на екипа...',
    dataLoadErrorLabel: 'Грешка при зареждане на данни',
    tryAgainLabel: 'Опитай отново',
    noTeamMembersLabel: 'Няма членове на екипа. Добавете първия служител.',
    sinceLabel: 'От',
    editLabel: 'Ред.',
    roleLabel: 'Роля',
    cancelLabel: 'Отказ',
    saveLabel: 'Запази',
  },
};
