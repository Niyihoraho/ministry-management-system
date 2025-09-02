# Permission System Structure

## Overview
This document outlines the comprehensive permission system for the ministry management application. The system uses a Role-Based Access Control (RBAC) model with granular permissions that can be scoped to different organizational levels.

## Permission Structure

### Core Components
Each permission consists of:
- **Name**: Unique identifier (e.g., `member_create`)
- **Description**: Human-readable description
- **Resource**: What entity the permission applies to (e.g., `member`, `training`)
- **Action**: What operation is allowed (e.g., `create`, `read`, `update`, `delete`)
- **Scope**: Where the permission applies (e.g., `global`, `regional`, `university`)

### Permission Scopes

#### 1. Global Scope
- **Description**: System-wide permissions
- **Who can have**: System administrators only
- **Examples**: 
  - `user_delete` - Delete any user
  - `system_settings` - Manage system settings
  - `region_create` - Create new regions

#### 2. Regional Scope
- **Description**: Permissions limited to a specific region
- **Who can have**: Regional administrators and below
- **Examples**:
  - `member_create` - Create members in assigned region
  - `training_manage` - Manage trainings in assigned region
  - `budget_approve` - Approve budgets in assigned region

#### 3. University Scope
- **Description**: Permissions limited to a specific university
- **Who can have**: University administrators and below
- **Examples**:
  - `smallgroup_create` - Create small groups at assigned university
  - `member_read` - View members at assigned university

#### 4. Small Group Scope
- **Description**: Permissions limited to a specific small group
- **Who can have**: Small group leaders
- **Examples**:
  - `attendance_record` - Record attendance for assigned small group
  - `member_update` - Update members in assigned small group

#### 5. Alumni Group Scope
- **Description**: Permissions limited to alumni small groups
- **Who can have**: Alumni group leaders
- **Examples**:
  - `alumni_event_create` - Create events for alumni group
  - `member_manage` - Manage alumni members

#### 6. Personal Scope
- **Description**: User-specific permissions
- **Who can have**: All authenticated users
- **Examples**:
  - `profile_update` - Update own profile
  - `dashboard_view` - View personal dashboard

## Resource Categories

### 1. People Management
- **Members**: `member_create`, `member_read`, `member_update`, `member_delete`
- **Staff**: `staff_create`, `staff_read`, `staff_update`, `staff_delete`
- **Volunteers**: `volunteer_create`, `volunteer_read`, `volunteer_update`, `volunteer_delete`
- **Contributors**: `contributor_create`, `contributor_read`, `contributor_update`, `contributor_delete`

### 2. Activities & Events
- **Trainings**: `training_create`, `training_read`, `training_update`, `training_delete`
- **Events**: `event_create`, `event_read`, `event_update`, `event_delete`
- **Permanent Events**: `permanent_event_create`, `permanent_event_read`, `permanent_event_update`, `permanent_event_delete`
- **Attendance**: `attendance_create`, `attendance_read`, `attendance_update`, `attendance_delete`

### 3. Financial Management
- **Contributions**: `contribution_create`, `contribution_read`, `contribution_update`, `contribution_delete`
- **Designations**: `designation_create`, `designation_read`, `designation_update`, `designation_delete`
- **Budgets**: `budget_create`, `budget_read`, `budget_update`, `budget_delete`
- **Payment Transactions**: `payment_transaction_read`, `payment_transaction_update`, `payment_transaction_refund`

### 4. Organization Structure
- **Regions**: `region_create`, `region_read`, `region_update`, `region_delete`
- **Universities**: `university_create`, `university_read`, `university_update`, `university_delete`
- **Small Groups**: `smallgroup_create`, `smallgroup_read`, `smallgroup_update`, `smallgroup_delete`
- **Alumni Groups**: `alumni_group_create`, `alumni_group_read`, `alumni_group_update`, `alumni_group_delete`

### 5. System Administration
- **Users**: `user_create`, `user_read`, `user_update`, `user_delete`
- **Roles**: `role_create`, `role_read`, `role_update`, `role_delete`
- **Permissions**: `permission_create`, `permission_read`, `permission_update`, `permission_delete`
- **System**: `system_settings`, `system_audit`, `system_backup`, `system_maintenance`

### 6. Reports & Analytics
- **Reports**: `report_membership`, `report_financial`, `report_engagement`, `report_attendance`
- **Dashboard**: `dashboard_view`, `dashboard_regional`, `dashboard_national`
- **Export**: `export_members`, `export_contributions`, `export_reports`

### 7. Communication & Notifications
- **Notifications**: `notification_create`, `notification_read`, `notification_send`
- **Inbox**: `inbox_read`, `inbox_send`, `inbox_manage`
- **Calendar**: `calendar_view`, `calendar_create`, `calendar_update`, `calendar_delete`

## Action Types

### Basic CRUD Operations
- **Create**: `*_create` - Create new records
- **Read**: `*_read` - View existing records
- **Update**: `*_update` - Modify existing records
- **Delete**: `*_delete` - Remove records

### Specialized Actions
- **Manage**: `*_manage` - Full management (includes all CRUD operations)
- **Approve**: `*_approve` - Approve requests or actions
- **Reject**: `*_reject` - Reject requests or actions
- **Review**: `*_review` - Review items for approval
- **Export**: `*_export` - Export data to files
- **Import**: `*_import` - Import data from files
- **Schedule**: `*_schedule` - Schedule events or activities
- **Send**: `*_send` - Send communications
- **Refund**: `*_refund` - Process refunds
- **Activate**: `*_activate` - Activate/deactivate items

## Permission Hierarchy

### Scope Hierarchy (Most to Least Restrictive)
1. **Global** - System-wide access
2. **Regional** - Region-specific access
3. **University** - University-specific access
4. **Small Group** - Small group-specific access
5. **Alumni Group** - Alumni group-specific access
6. **Personal** - User-specific access

### Action Hierarchy (Most to Least Powerful)
1. **Manage** - Full control (includes all other actions)
2. **Delete** - Remove items
3. **Create/Update** - Modify items
4. **Read** - View items only

## Implementation Examples

### Example 1: Regional Admin Cannot Delete Members
```sql
-- Regional Admin role gets these permissions:
INSERT INTO rolepermission (roleId, permissionId) VALUES
(2, (SELECT id FROM permission WHERE name = 'member_create' AND scope = 'regional')),
(2, (SELECT id FROM permission WHERE name = 'member_read' AND scope = 'regional')),
(2, (SELECT id FROM permission WHERE name = 'member_update' AND scope = 'regional'));
-- Note: member_delete is NOT assigned (global scope only)
```

### Example 2: University Admin Limited to University Scope
```sql
-- University Admin role gets these permissions:
INSERT INTO rolepermission (roleId, permissionId) VALUES
(3, (SELECT id FROM permission WHERE name = 'smallgroup_create' AND scope = 'university')),
(3, (SELECT id FROM permission WHERE name = 'smallgroup_read' AND scope = 'university')),
(3, (SELECT id FROM permission WHERE name = 'smallgroup_update' AND scope = 'university'));
-- Cannot create/delete universities (regional scope)
```

### Example 3: System Administrator Full Access
```sql
-- System Admin role gets all permissions:
INSERT INTO rolepermission (roleId, permissionId)
SELECT 1, id FROM permission WHERE scope = 'global';
```

## Security Considerations

### 1. Scope Validation
- Always validate that users can only access resources within their assigned scope
- Example: Regional admin can only manage members in their assigned region

### 2. Action Validation
- Check both permission existence and scope before allowing actions
- Example: User must have `member_delete` permission AND appropriate scope

### 3. Audit Trail
- All permission changes should be logged in the audit log
- Track who granted permissions and when

### 4. Principle of Least Privilege
- Users should only have the minimum permissions necessary for their role
- Regular review of permissions to ensure they're still appropriate

## Frontend Implementation

### Permission Checking
```javascript
// Check if user has permission
const hasPermission = (permission, resource, action, scope) => {
  return userPermissions.some(p => 
    p.resource === resource && 
    p.action === action && 
    p.scope === scope
  );
};

// Example usage
if (hasPermission('member', 'delete', 'global')) {
  showDeleteButton();
}
```

### UI Rendering
```javascript
// Only show actions user has permission for
{hasPermission('member', 'create', 'regional') && (
  <Button onClick={createMember}>Create Member</Button>
)}

{hasPermission('member', 'delete', 'global') && (
  <Button onClick={deleteMember}>Delete Member</Button>
)}
```

## Database Schema

### Permission Table
```sql
CREATE TABLE permission (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  scope ENUM('global', 'regional', 'university', 'smallgroup', 'alumni_group', 'personal') DEFAULT 'global',
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT NOW(),
  updatedAt DATETIME DEFAULT NOW() ON UPDATE NOW()
);
```

### Role-Permission Relationship
```sql
CREATE TABLE rolepermission (
  id INT PRIMARY KEY AUTO_INCREMENT,
  roleId INT NOT NULL,
  permissionId INT NOT NULL,
  grantedAt DATETIME DEFAULT NOW(),
  grantedBy INT,
  UNIQUE KEY unique_role_permission (roleId, permissionId),
  FOREIGN KEY (roleId) REFERENCES role(id) ON DELETE CASCADE,
  FOREIGN KEY (permissionId) REFERENCES permission(id) ON DELETE CASCADE,
  FOREIGN KEY (grantedBy) REFERENCES user(id)
);
```

## Summary

This permission system provides:
- **Granular Control**: 150+ specific permissions
- **Scope Flexibility**: 6 different scope levels
- **Security**: Multi-layered validation
- **Scalability**: Easy to add new permissions
- **Auditability**: Complete tracking of permission changes
- **User-Friendly**: Clear naming conventions and descriptions

The system ensures that users can only perform actions they're explicitly authorized for, both at the frontend (UI visibility) and backend (API validation) levels. 