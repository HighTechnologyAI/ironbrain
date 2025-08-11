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
    aiTags: 'Tags:',
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
    aiTags: 'Теги:',
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
    aiTags: 'Етикети:',
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
  },
};
