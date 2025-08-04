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
