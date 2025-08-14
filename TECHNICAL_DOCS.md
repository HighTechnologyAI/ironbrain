# Tiger CRM - Technical Documentation

## Architecture Overview

Tiger CRM is built with a modern, scalable architecture focusing on security, performance, and maintainability.

### Technology Stack

**Frontend:**
- React 18.3.1 with TypeScript 5.5.3
- Vite 5.4.1 for build tooling
- Tailwind CSS 3.4.11 for styling
- shadcn/ui + Radix UI for components
- TanStack Query for state management
- React Router for navigation

**Backend:**
- Supabase (PostgreSQL + Edge Functions)
- Row Level Security (RLS) for data protection
- Real-time subscriptions
- File storage with security policies

**Security:**
- Content Security Policy (CSP)
- Input validation and sanitization
- Rate limiting
- Session management
- Security headers (HSTS, XSS Protection, etc.)

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── admin/          # Admin-specific components
│   └── neon/           # Custom neon-themed components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API service layers
├── utils/              # Utility functions
├── voice/              # Voice interaction system
├── i18n/               # Internationalization
└── tests/              # Test files
```

## Security Implementation

### Input Validation

All user inputs are validated and sanitized:

```typescript
import { validateUserInput } from '@/utils/security';

const result = validateUserInput(userInput);
if (!result.isValid) {
  throw new Error(result.error);
}
const safeInput = result.sanitized;
```

### Rate Limiting

Client-side rate limiting prevents abuse:

```typescript
import { RateLimiter } from '@/utils/security';

const limiter = new RateLimiter(5, 60000); // 5 requests per minute
if (!limiter.isAllowed(userId)) {
  throw new Error('Rate limit exceeded');
}
```

### Security Headers

Comprehensive security headers are configured in `vite.config.ts`:

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

## Database Design

### Core Tables

**profiles** - User information and roles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  full_name TEXT NOT NULL,
  role employee_role DEFAULT 'employee',
  position TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true
);
```

**tasks** - Task management
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority task_priority DEFAULT 'medium',
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  due_date TIMESTAMPTZ,
  estimated_hours INTEGER,
  actual_hours INTEGER
);
```

### Row Level Security (RLS)

All tables implement RLS policies:

```sql
-- Users can only see their own tasks or tasks they created
CREATE POLICY "Users can view accessible tasks" ON tasks
FOR SELECT USING (
  assigned_to IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  get_current_user_role() = 'admin'
);
```

## API Architecture

### Service Layer Pattern

Services encapsulate business logic and API interactions:

```typescript
// services/taskService.ts
export class TaskService {
  async createTask(data: CreateTaskData): Promise<Task> {
    // Validate input
    const validation = validateUserInput(data.title);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    // Create task
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({ ...data, title: validation.sanitized })
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return task;
  }
}
```

### Error Handling

Comprehensive error handling with boundaries:

```typescript
// Error boundary wrapper
<ErrorBoundary>
  <SomeComponent />
</ErrorBoundary>

// Async operation hook
const { execute, loading, error } = useAsyncOperation();
await execute(() => someAsyncOperation());
```

## Performance Optimizations

### Code Splitting

Heavy components are lazy-loaded:

```typescript
const LazyAdminPanel = lazy(() => import('@/pages/AdminPanel'));

<LazyComponentWrapper>
  <LazyAdminPanel />
</LazyComponentWrapper>
```

### Memoization

Components are optimized with React.memo:

```typescript
const TaskCard = memo<TaskCardProps>(({ task, onClick }) => {
  const memoizedValue = useMemo(() => 
    expensiveCalculation(task), [task]
  );
  
  const handleClick = useCallback(() => 
    onClick(task), [onClick, task]
  );
  
  return <Card onClick={handleClick}>{memoizedValue}</Card>;
});
```

### Query Optimization

TanStack Query with optimized caching:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
    },
  },
});
```

## Feature Flag System

Dynamic feature management:

```typescript
import { FeatureGate, isFeatureEnabled } from '@/utils/features';

// Conditional rendering
<FeatureGate feature="UAV_OPERATIONS">
  <UAVDashboard />
</FeatureGate>

// Programmatic checks
if (isFeatureEnabled('AI_ASSISTANT')) {
  // Enable AI features
}
```

## Internationalization

Multi-language support with i18next:

```typescript
import { useLanguage } from '@/hooks/use-language';

const { t, language, setLanguage } = useLanguage();
return <h1>{t('welcome')}</h1>;
```

## Voice Integration

AI-powered voice assistant:

```typescript
import { VoiceManager } from '@/voice/VoiceManager';

<VoiceManager defaultConfig={{
  provider: 'openai',
  mode: 'simple-button'
}}>
  <App />
</VoiceManager>
```

## Testing Strategy

### Unit Tests

Components and utilities are tested with Vitest:

```typescript
describe('TaskService', () => {
  it('should create tasks with validation', async () => {
    const taskData = { title: 'Test Task', priority: 'high' };
    const result = await taskService.createTask(taskData);
    expect(result.title).toBe('Test Task');
  });
});
```

### Security Tests

Security utilities are thoroughly tested:

```typescript
describe('Security Utils', () => {
  it('should detect XSS attempts', () => {
    const result = validateUserInput('<script>alert("xss")</script>');
    expect(result.sanitized).not.toContain('<script>');
  });
});
```

## Deployment

### CI/CD Pipeline

GitHub Actions automate testing and deployment:

```yaml
- name: Security Audit
  run: npm audit --audit-level=moderate

- name: Build and Test
  run: |
    npm ci
    npm run type-check
    npm run test:ci
    npm run build
```

### Environment Configuration

Secure environment variable management:

```typescript
// Only expose safe public variables
const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  // Never expose private keys to client
};
```

## Monitoring and Logging

### Security Event Logging

Comprehensive security event tracking:

```typescript
import { securityLogger } from '@/utils/security-headers';

securityLogger.log({
  type: 'authentication_failure',
  severity: 'medium',
  userId: user.id,
  details: { reason: 'invalid_credentials' }
});
```

### Performance Monitoring

Bundle size monitoring and performance tracking:

```json
{
  "bundlesize": [
    {
      "path": "./dist/assets/*.js",
      "maxSize": "300kb",
      "compression": "gzip"
    }
  ]
}
```

## Development Guidelines

### Code Quality

- TypeScript strict mode enabled
- ESLint with security rules
- Prettier for code formatting
- Husky for pre-commit hooks

### Security Best Practices

- Input validation on all user data
- XSS prevention through sanitization
- SQL injection prevention through parameterized queries
- Rate limiting on sensitive operations
- Regular dependency audits

### Performance Guidelines

- Lazy load non-critical components
- Memoize expensive calculations
- Optimize bundle size
- Use proper caching strategies

## Troubleshooting

### Common Issues

**Build Errors:**
- Check TypeScript configuration
- Verify all imports are correct
- Ensure dependencies are installed

**Security Warnings:**
- Review input validation
- Check for exposed secrets
- Verify HTTPS configuration

**Performance Issues:**
- Analyze bundle size
- Check for memory leaks
- Optimize component renders

### Debug Tools

- React DevTools for component debugging
- Network tab for API inspection
- Console logs (development only)
- Error boundaries for graceful failures

---

For more detailed information, refer to the individual component documentation and code comments.