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
  close: string;
  
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
  
  // Task Details Modal
  details: string;
  description: string;
  tags: string;
  actions: string;
  
  // AI Assistant
  aiTaskAssistant: string;
  aiAnalyzeContext: string;
  exampleQuestions: string;
  howToBest: string;
  breakIntoSubtasks: string;
  giveRecommendations: string;
  askAiAboutTask: string;
  enterToSend: string;
  shiftEnterNewLine: string;
  
  // Task Comments
  taskComments: string;
  taskCommentsDescription: string;
  taskCommentsWelcome: string;
  taskCommentsInviteTeam: string;
  taskCommentsSelectTeamMember: string;
  taskCommentsInvite: string;
  taskCommentsInvited: string;
  taskCommentsWriteComment: string;
  taskCommentsAttachFiles: string;
  taskCommentsAttachedFiles: string;
  taskCommentsSend: string;
  taskCommentsUploading: string;
  taskCommentsUploadedBy: string;
  taskCommentsLoading: string;
  taskCommentsSending: string;
  
  // Task Invitations
  taskInvitationsPending: string;
  taskInvitationsDescription: string;
  taskChatInvitation: string;
  task: string;
  accept: string;
  decline: string;
  accepting: string;
  declining: string;
  
  // Messages
  taskStatusUpdated: string;
  taskStatusUpdateError: string;
  tasksLoadError: string;
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
    close: 'Close',
    
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
    
    // Task Details Modal
    details: 'Details',
    description: 'Description',
    tags: 'Tags',
    actions: 'Actions',
    
    // AI Assistant
    aiTaskAssistant: 'AI Task Assistant',
    aiAnalyzeContext: 'I analyze the context of this task and can help with planning, recommendations and optimization.',
    exampleQuestions: 'Example questions:',
    howToBest: 'How to best complete this task?',
    breakIntoSubtasks: 'Break into subtasks',
    giveRecommendations: 'Give recommendations',
    askAiAboutTask: 'Ask AI assistant about the task...',
    enterToSend: 'Enter - send',
    shiftEnterNewLine: 'Shift+Enter - new line',
    tigerAI: 'Tiger AI',
    aiGreeting: 'Hello! I am Tiger AI - your personal assistant for task',
    aiKnowDetails: 'I know all the details of this task:',
    aiPriority: 'Priority',
    aiStatus: 'Status',
    aiAssignee: 'Assignee',
    aiEstimated: 'Estimated time',
    aiTags: 'Tags',
    aiNoTags: 'No tags',
    aiCanHelp: 'How can I help? I can:',
    aiBreakTask: '✓ Break the task into subtasks',
    aiGiveRecommendations: '✓ Give recommendations for execution',
    aiHelpPlanning: '✓ Help with time planning',
    aiAnswerQuestions: '✓ Answer questions about the context',
    aiSuggestApproach: '✓ Suggest optimal approach',
    
    // Task Comments
    taskComments: 'Comments',
    taskCommentsDescription: 'Team chat for this task',
    taskCommentsWelcome: 'Task chat "{taskTitle}" has been created. You can discuss details, attach files and invite team members.',
    taskCommentsInviteTeam: 'Invite team member',
    taskCommentsSelectTeamMember: 'Select team member...',
    taskCommentsInvite: 'Invite',
    taskCommentsInvited: '{email} has been invited to the task chat',
    taskCommentsWriteComment: 'Write a comment...',
    taskCommentsAttachFiles: 'Attach files',
    taskCommentsAttachedFiles: 'Attached files',
    taskCommentsSend: 'Send',
    taskCommentsUploading: 'Uploading...',
    taskCommentsUploadedBy: 'uploaded by',
    taskCommentsLoading: 'Loading team members...',
    taskCommentsSending: 'Sending...',
    
    // Task Invitations
    taskInvitationsPending: 'Pending Task Invitations',
    taskInvitationsDescription: 'You have been invited to join task chats',
    taskChatInvitation: 'Task Chat Invitation',
    task: 'Task',
    accept: 'Accept',
    decline: 'Decline',
    accepting: 'Accepting...',
    declining: 'Declining...',
    
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
    close: 'Закрыть',
    
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
    
    // Task Details Modal
    details: 'Детали',
    description: 'Описание',
    tags: 'Теги',
    actions: 'Действия',
    
    // AI Assistant
    aiTaskAssistant: 'AI Помощник по задаче',
    aiAnalyzeContext: 'Анализирую контекст этой задачи и могу помочь с планированием, рекомендациями и оптимизацией выполнения.',
    exampleQuestions: 'Примеры вопросов:',
    howToBest: 'Как лучше выполнить эту задачу?',
    breakIntoSubtasks: 'Разбей на подзадачи',
    giveRecommendations: 'Дай рекомендации',
    askAiAboutTask: 'Спросите AI помощника о задаче...',
    enterToSend: 'Enter - отправить',
    shiftEnterNewLine: 'Shift+Enter - новая строка',
    tigerAI: 'Tiger AI',
    aiGreeting: 'Здравствуйте! Я Tiger AI - ваш персональный помощник для задачи',
    aiKnowDetails: 'Я знаю все детали этой задачи:',
    aiPriority: 'Приоритет',
    aiStatus: 'Статус',
    aiAssignee: 'Исполнитель',
    aiEstimated: 'Планируемое время',
    aiTags: 'Теги',
    aiNoTags: 'Нет тегов',
    aiCanHelp: 'Чем могу помочь? Я могу:',
    aiBreakTask: '✓ Разбить задачу на подзадачи',
    aiGiveRecommendations: '✓ Дать рекомендации по выполнению',
    aiHelpPlanning: '✓ Помочь с планированием времени',
    aiAnswerQuestions: '✓ Ответить на вопросы по контексту',
    aiSuggestApproach: '✓ Предложить оптимальный подход',
    
    // Task Comments
    taskComments: 'Комментарии',
    taskCommentsDescription: 'Командный чат для этой задачи',
    taskCommentsWelcome: 'Чат задачи "{taskTitle}" создан. Вы можете обсуждать детали, прикреплять файлы и приглашать участников команды.',
    taskCommentsInviteTeam: 'Пригласить участника команды',
    taskCommentsSelectTeamMember: 'Выберите участника команды...',
    taskCommentsInvite: 'Пригласить',
    taskCommentsInvited: '{email} приглашен в чат задачи',
    taskCommentsWriteComment: 'Написать комментарий...',
    taskCommentsAttachFiles: 'Прикрепить файлы',
    taskCommentsAttachedFiles: 'Прикрепленные файлы',
    taskCommentsSend: 'Отправить',
    taskCommentsUploading: 'Загрузка...',
    taskCommentsUploadedBy: 'загружено',
    taskCommentsLoading: 'Загрузка участников команды...',
    taskCommentsSending: 'Отправка...',
    
    // Task Invitations
    taskInvitationsPending: 'Ожидающие приглашения в задачи',
    taskInvitationsDescription: 'Вас пригласили присоединиться к чатам задач',
    taskChatInvitation: 'Приглашение в чат задачи',
    task: 'Задача',
    accept: 'Принять',
    decline: 'Отклонить',
    accepting: 'Принятие...',
    declining: 'Отклонение...',
    
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
    close: 'Затвори',
    
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
    dashboard: 'Табло',
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
    dataLoadError: 'Грешка при зареждане на данните',
    tryAgain: 'Опитай отново',
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
    offline: 'Извън линия',

    // Index page
    goingToTasks: 'Отиване към задачите',
    openingTasksList: 'Отваряне на списъка със задачи...',
    goingToTeam: 'Отиване към екипа',
    openingTeamManagement: 'Отваряне на управлението на екипа...',
    goingToAchievements: 'Отиване към постиженията',
    openingAchievements: 'Отваряне на наградите и постиженията...',
    personalTasksDesc: 'Управление на лични задачи',
    teamDesc: 'Екип и служители',
    projectsDesc: 'Активни проекти',
    analyticsDesc: 'Анализи и отчети',
    problemsDesc: 'Проблеми изискващи внимание',
    achievementsDesc: 'Награди и постижения',
    adminDesc: 'Управление на системата и външен контрол',
    perWeek: 'на седмица',
    active: 'Активни',
    users: 'потребители',
    aiAssistantDesc: 'Личен асистент за създаване на задачи с отчитане на уменията на всеки служител',
    personalization: 'Персонализация',
    smartTasks: 'Умни задачи',
    loadAnalysis: 'Анализ на натоварването',
    
    // Tasks
    tasksTitle: 'Управление на задачи',
    tasksDescription: 'Създавайте и проследявайте задачи за вашия екип',
    allTasks: 'Всички задачи',
    myTasks: 'Моите задачи',
    createdByMe: 'Създадени от мен',
    taskStatus: 'Статус',
    taskPriority: 'Приоритет',
    searchTasks: 'Търси задачи...',
    createTask: 'Създай задача',
    startWork: 'Започни работа',
    complete: 'Завърши',
    assignee: 'Изпълнител',
    dueDate: 'До',
    estimated: 'Планирано',
    actual: 'Действително',
    hours: 'ч',
    created: 'Създадена',
    noTasksFound: 'Не са намерени задачи',
    noTasksFoundDesc: 'Създайте първата задача или променете филтрите за търсене',
    noActiveTasks: 'Нямате активни задачи',
    noActiveTasksDesc: 'Задачите, възложени на вас, ще се появят тук',
    noCreatedTasks: 'Все още не сте създали нито една задача',
    noCreatedTasksDesc: 'Кликнете "Създай задача" за да започнете',
    
    // Task Status
    pending: 'Чакаща',
    inProgress: 'В процес',
    completed: 'Завършена',
    cancelled: 'Отменена',
    onHold: 'Спряна',
    
    // Task Priority
    low: 'Нисък',
    medium: 'Среден',
    high: 'Висок',
    critical: 'Критичен',
    
    // Statuses
    allStatuses: 'Всички статуси',
    allPriorities: 'Всички приоритети',
    
    // Task Details Modal
    details: 'Детайли',
    description: 'Описание',
    tags: 'Тагове',
    actions: 'Действия',
    
    // AI Assistant
    aiTaskAssistant: 'AI Асистент за задачата',
    aiAnalyzeContext: 'Анализирам контекста на тази задача и мога да помогна с планиране, препоръки и оптимизация на изпълнението.',
    exampleQuestions: 'Примерни въпроси:',
    howToBest: 'Как най-добре да изпълня тази задача?',
    breakIntoSubtasks: 'Раздели на подзадачи',
    giveRecommendations: 'Дай препоръки',
    askAiAboutTask: 'Попитайте AI асистента за задачата...',
    enterToSend: 'Enter - изпрати',
    shiftEnterNewLine: 'Shift+Enter - нов ред',
    tigerAI: 'Tiger AI',
    aiGreeting: 'Здравей! Аз съм Tiger AI - твоят персонален асистент за задача',
    aiKnowDetails: 'Знам всички детайли на тази задача:',
    aiPriority: 'Приоритет',
    aiStatus: 'Статус',
    aiAssignee: 'Изпълнител',
    aiEstimated: 'Планирано време',
    aiTags: 'Тагове',
    aiNoTags: 'Няма тагове',
    aiCanHelp: 'С какво мога да помогна? Мога да:',
    aiBreakTask: '✓ Разделя задачата на подзадачи',
    aiGiveRecommendations: '✓ Дам препоръки за изпълнение',
    aiHelpPlanning: '✓ Помогна с планирането на времето',
    aiAnswerQuestions: '✓ Отговоря на въпроси по контекста',
    aiSuggestApproach: '✓ Предложа оптимален подход',
    
    // Task Comments
    taskComments: 'Коментари',
    taskCommentsDescription: 'Екипен чат за тази задача',
    taskCommentsWelcome: 'Чатът на задача "{taskTitle}" е създаден. Можете да обсъждате детайли, прикачвате файлове и каните членове на екипа.',
    taskCommentsInviteTeam: 'Покани член на екипа',
    taskCommentsSelectTeamMember: 'Изберете член на екипа...',
    taskCommentsInvite: 'Покани',
    taskCommentsInvited: '{email} е поканен в чата на задачата',
    taskCommentsWriteComment: 'Напишете коментар...',
    taskCommentsAttachFiles: 'Прикачете файлове',
    taskCommentsAttachedFiles: 'Прикачени файлове',
    taskCommentsSend: 'Изпрати',
    taskCommentsUploading: 'Качване...',
    taskCommentsUploadedBy: 'качено от',
    taskCommentsLoading: 'Зареждане на членове на екипа...',
    taskCommentsSending: 'Изпращане...',
    
    // Task Invitations
    taskInvitationsPending: 'Чакащи покани за задачи',
    taskInvitationsDescription: 'Поканени сте да се присъедините към чатове на задачи',
    taskChatInvitation: 'Покана за чат на задача',
    task: 'Задача',
    accept: 'Приеми',
    decline: 'Откажи',
    accepting: 'Приемане...',
    declining: 'Отказване...',
    
    // Messages
    taskStatusUpdated: 'Статусът на задачата е актуализиран',
    taskStatusUpdateError: 'Неуспешна актуализация на статуса на задачата',
    tasksLoadError: 'Неуспешно зареждане на задачите',
  },
};

// Demo task translations for multilingual support
export const demoTaskTranslations: Record<string, Record<string, { title: string; description: string; tags: string[] }>> = {
  en: {
    'test-system-operation': {
      title: 'Conduct test system operation',
      description: '1. Launch test scenario using standard Tiger Technology AI parameters. 2. Track execution logs and record any anomalies. 3. Check correctness of all scenario stages execution. 4. Prepare brief report with findings and recommendations for optimization. 5. Submit report to team by end of day.',
      tags: ['testing', 'report', 'analysis']
    },
    'xuesoc': {
      title: 'XUESOC',
      description: 'TEST',
      tags: ['test']
    },
    'system-testing': {
      title: 'System testing tasks',
      description: 'Conduct aggressive testing of system task setting functionality Tiger Technology AI. Steps: 1) Create test task; 2) Check correctness of display and statuses; 3) Test scenarios with different priorities and deadlines; 4) Record bugs and inconsistencies; 5) Prepare report with optimization recommendations.',
      tags: ['testing', 'system', 'optimization']
    }
  },
  ru: {
    'test-system-operation': {
      title: 'Провести тестовую операцию системы',
      description: '1. Запусти тестовый сценарий, используя стандартные параметры Tiger Technology AI. 2. Отследи логи выполнения и зафиксируй любые аномалии. 3. Проверь корректность выполнения всех этапов сценария. 4. Подготовь краткий отчет с выводами и предложениями по оптимизации. 5. Передай отчет тимлиду до конца дня.',
      tags: ['тестирование', 'отчет', 'анализ']
    },
    'xuesoc': {
      title: 'ХУЕСОС',
      description: 'ТЕСТ',
      tags: ['тест']
    },
    'system-testing': {
      title: 'Тестирование системы задач',
      description: 'Проведи агрессивный тест функциональности системы постановки задач Tiger Technology AI. Шаги: 1) Создай тестовую задачу; 2) Проверь корректность отображения и статусов; 3) Протестируй сценарии с разными приоритетами и дедлайнами; 4) Зафиксируй баги и несоответствия; 5) Подготовь отчет с предложениями по оптимизации.',
      tags: ['тестирование', 'система', 'оптимизация']
    }
  },
  bg: {
    'test-system-operation': {
      title: 'Проведи тестова операция на системата',
      description: '1. Стартирай тестов сценарий, използвайки стандартните параметри на Tiger Technology AI. 2. Проследи логовете на изпълнението и фиксирай всички аномалии. 3. Провери правилността на изпълнението на всички етапи от сценария. 4. Подготви кратък отчет с изводи и предложения за оптимизация. 5. Предай отчета на екипа до края на деня.',
      tags: ['тестване', 'отчет', 'анализ']
    },
    'xuesoc': {
      title: 'ХУЕСОС',
      description: 'ТЕСТ',
      tags: ['тест']
    },
    'system-testing': {
      title: 'Тестване на системата за задачи',
      description: 'Проведи агресивен тест на функционалността на системата за поставяне на задачи Tiger Technology AI. Стъпки: 1) Създай тестова задача; 2) Провери правилността на показването и статусите; 3) Тествай сценарии с различни приоритети и крайни срокове; 4) Фиксирай бъгове и несъответствия; 5) Подготви отчет с предложения за оптимизация.',
      tags: ['тестване', 'система', 'оптимизация']
    }
  }
};

// Function to translate task content based on current language
export const translateTaskContent = (task: any, language: string) => {
  // Create a unique key for the task based on its title or id
  const taskKey = task.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || task.id;
  
  // Check if we have translations for this task
  const translations = demoTaskTranslations[language];
  if (translations && translations[taskKey]) {
    return {
      ...task,
      title: translations[taskKey].title,
      description: translations[taskKey].description,
      tags: translations[taskKey].tags
    };
  }
  
  // If no translation found, return original task
  return task;
};

