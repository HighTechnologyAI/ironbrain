export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const languages: Language[] = [
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
