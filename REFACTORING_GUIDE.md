# TIGER TECH Ecosystem Refactoring Guide

## Overview
This guide follows the systematic refactoring methodology for the Tiger CRM and Jetson Nano GCS ecosystem, focusing on modularity, maintainability, and reliability.

## ✅ Phase 1: Structure and Configuration (COMPLETED)

### Goals
- [x] Remove all VITE_* environment variables
- [x] Centralize configuration management
- [x] Create service layer architecture
- [x] Fix authentication session handling
- [x] Establish proper TypeScript types

### Results
- **15 VITE_* variables eliminated**
- **Centralized ConfigService** replaces scattered config
- **AuthService** with proper session management
- **Service layer** for missions, drones, configuration
- **Type safety** improved across all services

## 🔄 Phase 2: Jetson Nano GCS Modularization

### Goals
- [ ] Refactor `jetson_soft/gcs-backend/` into modular services
- [ ] Eliminate code duplication in telemetry handling
- [ ] Add graceful degradation for service failures
- [ ] Implement store-and-forward for connection loss

### Service Architecture Plan

```
jetson_soft/gcs-backend/src/services/
├── mavlink_bridge.py       # MAVLink communication
├── video_service.py        # NVENC/NVDEC streaming  
├── telemetry_buffer.py     # Store-and-forward telemetry
├── central_server_sync.py  # Supabase/WebSocket integration
└── utils/
    └── serialization.py    # JSON conversion utilities
```

### Implementation Steps

#### 2.1 MAVLink Bridge Service
```python
# jetson_soft/gcs-backend/src/services/mavlink_bridge.py
class MAVLinkBridge:
    def __init__(self):
        self.connection = None
        self.message_handlers = {}
        self.stats = {'messages_received': 0, 'messages_sent': 0}
    
    def connect(self, connection_string: str) -> bool:
        # Implement robust connection logic
        pass
    
    def register_handler(self, message_type: str, handler: callable):
        # Register message type handlers
        pass
```

#### 2.2 Telemetry Buffer Service
```python
# jetson_soft/gcs-backend/src/services/telemetry_buffer.py
class TelemetryBuffer:
    def __init__(self, max_size: int = 1000):
        self.buffer = deque(maxlen=max_size)
        self.failed_transmissions = deque(maxlen=100)
    
    def add_telemetry(self, data: dict):
        # Add to buffer with timestamp
        pass
    
    def sync_to_server(self) -> bool:
        # Attempt to sync buffered data
        pass
```

#### 2.3 Video Service Optimization
- Separate hardware detection from streaming logic
- Add pipeline templates for different sources
- Implement adaptive quality based on bandwidth

### Code Elimination Targets
1. **Telemetry JSON conversion** - currently duplicated 3+ times
2. **Connection state management** - scattered across services
3. **Error handling patterns** - inconsistent implementations

## 🔄 Phase 3: Lovable UI Component Architecture

### Goals
- [ ] Create focused component directories
- [ ] Extract reusable mission/drone components
- [ ] Implement proper loading states
- [ ] Add comprehensive error boundaries

### Component Structure Plan

```
src/components/
├── MissionConsole/         # Mission-specific components
│   ├── MissionList.tsx
│   ├── MissionDetails.tsx
│   ├── WaypointEditor.tsx
│   └── MissionStatus.tsx
├── GlobalMap/              # Map components
│   ├── MapContainer.tsx
│   ├── DroneMarkers.tsx
│   ├── FlightPath.tsx
│   └── WaypointMarkers.tsx
├── DroneEcosystemManager/ # Drone management
│   ├── DroneList.tsx
│   ├── DroneCard.tsx
│   ├── TelemetryDisplay.tsx
│   └── DroneControls.tsx
└── SOCPanel/              # Security operations
    ├── AlertsPanel.tsx
    ├── SystemStatus.tsx
    └── MetricsDisplay.tsx
```

### Service Integration
- Replace direct Supabase calls with service layer
- Implement proper error handling with user feedback
- Add loading states for all async operations

## 🔄 Phase 4: Database Schema Normalization

### Goals
- [ ] Normalize missions, drones, telemetry tables
- [ ] Implement comprehensive RLS policies
- [ ] Move business logic to Edge Functions
- [ ] Add proper indexing and constraints

### Schema Improvements Plan

#### 4.1 Table Relationships
```sql
-- Normalized schema structure
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'basic'
);

CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  status mission_status DEFAULT 'planning',
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE mission_waypoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  lat DECIMAL(10,8) NOT NULL,
  lon DECIMAL(11,8) NOT NULL,
  alt_meters INTEGER NOT NULL
);
```

#### 4.2 RLS Policy Templates
```sql
-- Template for organization-scoped data
CREATE POLICY "org_members_only" ON {table_name}
FOR ALL USING (org_id = get_current_user_org_id());

-- Template for user-owned data
CREATE POLICY "owner_only" ON {table_name}
FOR ALL USING (created_by = get_current_user_profile_id());
```

#### 4.3 Edge Functions Migration
- Move telemetry validation to Edge Functions
- Implement mission planning logic server-side
- Add webhook handlers for external integrations

## 🔄 Phase 5: Testing and CI/CD

### Goals
- [ ] Add smoke tests for key functions
- [ ] Set up automated testing pipeline
- [ ] Implement regression test suite
- [ ] Add performance benchmarks

### Testing Strategy

#### 5.1 Frontend Tests
```typescript
// Example smoke test for MissionService
describe('MissionService', () => {
  it('should create mission successfully', async () => {
    const mission = await MissionService.createMission({
      name: 'Test Mission',
      description: 'Test description'
    });
    expect(mission.data).toBeDefined();
    expect(mission.error).toBeNull();
  });
});
```

#### 5.2 Backend Tests
```python
# Example test for MAVLink service
def test_mavlink_connection():
    service = MAVLinkBridge()
    assert service.connect('udp:localhost:14550')
    assert service.is_connected
    service.disconnect()
    assert not service.is_connected
```

#### 5.3 Integration Tests
- Test Jetson ↔ Supabase synchronization
- Validate real-time data flow
- Test failover scenarios

## 📊 Progress Tracking

### Phase Completion Checklist

#### Phase 1 ✅ COMPLETE
- [x] VITE_* variables eliminated
- [x] ConfigService implemented
- [x] AuthService with proper session handling
- [x] Service layer architecture
- [x] TypeScript type safety

#### Phase 2 🔄 IN PROGRESS
- [ ] MAVLink bridge service extracted
- [ ] Telemetry buffer implemented
- [ ] Video service modularized
- [ ] Code duplication eliminated

#### Phase 3 📋 PLANNED
- [ ] Component architecture refactored
- [ ] Reusable components extracted
- [ ] Error boundaries implemented
- [ ] Loading states standardized

#### Phase 4 📋 PLANNED
- [ ] Database schema normalized
- [ ] RLS policies comprehensive
- [ ] Business logic in Edge Functions
- [ ] Performance optimized

#### Phase 5 📋 PLANNED
- [ ] Test coverage > 80%
- [ ] CI/CD pipeline active
- [ ] Regression tests passing
- [ ] Performance benchmarks met

## 🚀 Benefits Achieved

### Technical Benefits
- **Maintainability**: Modular architecture, single responsibility
- **Type Safety**: Full TypeScript coverage, compile-time checks  
- **Performance**: Optimized for Jetson Nano constraints
- **Reliability**: Graceful degradation, error recovery

### Operational Benefits
- **Debugging**: Centralized logging, clear error messages
- **Deployment**: Automated testing, consistent environments
- **Scaling**: Service-oriented architecture
- **Security**: Proper RLS, validated inputs

## 📝 Documentation Standards

### Code Documentation
- All public methods must have JSDoc/docstrings
- Complex algorithms require inline comments
- Service interfaces fully documented
- API contracts clearly defined

### Architecture Documentation
- Service interaction diagrams
- Database relationship diagrams  
- Deployment architecture
- Security model documentation

This refactoring follows the principle: **"Refactor without changing what the user sees"** - all functionality remains identical while improving code quality and maintainability.