-- =====================================================
-- PERMISSION SEEDING SCRIPT
-- This script creates all permissions for the system
-- =====================================================

-- Clear existing permissions (if any)
DELETE FROM rolepermission;
DELETE FROM permission;

-- Reset auto-increment
ALTER TABLE permission AUTO_INCREMENT = 1;

-- =====================================================
-- MEMBER PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('member_create', 'Create new members', 'member', 'create', 'regional', true, NOW(), NOW()),
('member_read', 'View member information', 'member', 'read', 'regional', true, NOW(), NOW()),
('member_update', 'Update member information', 'member', 'update', 'regional', true, NOW(), NOW()),
('member_delete', 'Delete members', 'member', 'delete', 'global', true, NOW(), NOW()),
('member_export', 'Export member data', 'member', 'export', 'regional', true, NOW(), NOW()),
('member_import', 'Import member data', 'member', 'import', 'regional', true, NOW(), NOW()),
('member_manage', 'Full member management', 'member', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- STAFF PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('staff_create', 'Create staff profiles', 'staff', 'create', 'regional', true, NOW(), NOW()),
('staff_read', 'View staff information', 'staff', 'read', 'regional', true, NOW(), NOW()),
('staff_update', 'Update staff information', 'staff', 'update', 'regional', true, NOW(), NOW()),
('staff_delete', 'Delete staff profiles', 'staff', 'delete', 'global', true, NOW(), NOW()),
('staff_manage', 'Full staff management', 'staff', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- VOLUNTEER PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('volunteer_create', 'Create volunteer profiles', 'volunteer', 'create', 'regional', true, NOW(), NOW()),
('volunteer_read', 'View volunteer information', 'volunteer', 'read', 'regional', true, NOW(), NOW()),
('volunteer_update', 'Update volunteer information', 'volunteer', 'update', 'regional', true, NOW(), NOW()),
('volunteer_delete', 'Delete volunteer profiles', 'volunteer', 'delete', 'global', true, NOW(), NOW()),
('volunteer_manage', 'Full volunteer management', 'volunteer', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- CONTRIBUTOR PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('contributor_create', 'Create contributor profiles', 'contributor', 'create', 'regional', true, NOW(), NOW()),
('contributor_read', 'View contributor information', 'contributor', 'read', 'regional', true, NOW(), NOW()),
('contributor_update', 'Update contributor information', 'contributor', 'update', 'regional', true, NOW(), NOW()),
('contributor_delete', 'Delete contributor profiles', 'contributor', 'delete', 'global', true, NOW(), NOW()),
('contributor_manage', 'Full contributor management', 'contributor', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- TRAINING PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('training_create', 'Create new trainings', 'training', 'create', 'regional', true, NOW(), NOW()),
('training_read', 'View training information', 'training', 'read', 'regional', true, NOW(), NOW()),
('training_update', 'Update training details', 'training', 'update', 'regional', true, NOW(), NOW()),
('training_delete', 'Delete trainings', 'training', 'delete', 'global', true, NOW(), NOW()),
('training_manage', 'Full training management', 'training', 'manage', 'regional', true, NOW(), NOW()),
('training_schedule', 'Schedule trainings', 'training', 'schedule', 'regional', true, NOW(), NOW()),
('training_approve', 'Approve training requests', 'training', 'approve', 'regional', true, NOW(), NOW());

-- =====================================================
-- ATTENDANCE PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('attendance_create', 'Record attendance', 'attendance', 'create', 'regional', true, NOW(), NOW()),
('attendance_read', 'View attendance records', 'attendance', 'read', 'regional', true, NOW(), NOW()),
('attendance_update', 'Update attendance records', 'attendance', 'update', 'regional', true, NOW(), NOW()),
('attendance_delete', 'Delete attendance records', 'attendance', 'delete', 'global', true, NOW(), NOW()),
('attendance_manage', 'Full attendance management', 'attendance', 'manage', 'regional', true, NOW(), NOW()),
('attendance_export', 'Export attendance reports', 'attendance', 'export', 'regional', true, NOW(), NOW());

-- =====================================================
-- EVENT PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('event_create', 'Create ministry events', 'event', 'create', 'regional', true, NOW(), NOW()),
('event_read', 'View event information', 'event', 'read', 'regional', true, NOW(), NOW()),
('event_update', 'Update event details', 'event', 'update', 'regional', true, NOW(), NOW()),
('event_delete', 'Delete events', 'event', 'delete', 'global', true, NOW(), NOW()),
('event_manage', 'Full event management', 'event', 'manage', 'regional', true, NOW(), NOW()),
('event_schedule', 'Schedule events', 'event', 'schedule', 'regional', true, NOW(), NOW());

-- =====================================================
-- PERMANENT MINISTRY EVENT PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('permanent_event_create', 'Create permanent ministry events', 'permanent_event', 'create', 'regional', true, NOW(), NOW()),
('permanent_event_read', 'View permanent event information', 'permanent_event', 'read', 'regional', true, NOW(), NOW()),
('permanent_event_update', 'Update permanent event details', 'permanent_event', 'update', 'regional', true, NOW(), NOW()),
('permanent_event_delete', 'Delete permanent events', 'permanent_event', 'delete', 'global', true, NOW(), NOW()),
('permanent_event_manage', 'Full permanent event management', 'permanent_event', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- CONTRIBUTION PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('contribution_create', 'Create contributions', 'contribution', 'create', 'regional', true, NOW(), NOW()),
('contribution_read', 'View contribution information', 'contribution', 'read', 'regional', true, NOW(), NOW()),
('contribution_update', 'Update contribution details', 'contribution', 'update', 'regional', true, NOW(), NOW()),
('contribution_delete', 'Delete contributions', 'contribution', 'delete', 'global', true, NOW(), NOW()),
('contribution_manage', 'Full contribution management', 'contribution', 'manage', 'regional', true, NOW(), NOW()),
('contribution_approve', 'Approve contributions', 'contribution', 'approve', 'regional', true, NOW(), NOW()),
('contribution_refund', 'Process refunds', 'contribution', 'refund', 'global', true, NOW(), NOW()),
('contribution_export', 'Export contribution reports', 'contribution', 'export', 'regional', true, NOW(), NOW());

-- =====================================================
-- DESIGNATION PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('designation_create', 'Create contribution designations', 'designation', 'create', 'regional', true, NOW(), NOW()),
('designation_read', 'View designation information', 'designation', 'read', 'regional', true, NOW(), NOW()),
('designation_update', 'Update designation details', 'designation', 'update', 'regional', true, NOW(), NOW()),
('designation_delete', 'Delete designations', 'designation', 'delete', 'global', true, NOW(), NOW()),
('designation_manage', 'Full designation management', 'designation', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- BUDGET PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('budget_create', 'Create budgets', 'budget', 'create', 'regional', true, NOW(), NOW()),
('budget_read', 'View budget information', 'budget', 'read', 'regional', true, NOW(), NOW()),
('budget_update', 'Update budget details', 'budget', 'update', 'regional', true, NOW(), NOW()),
('budget_delete', 'Delete budgets', 'budget', 'delete', 'global', true, NOW(), NOW()),
('budget_manage', 'Full budget management', 'budget', 'manage', 'regional', true, NOW(), NOW()),
('budget_approve', 'Approve budgets', 'budget', 'approve', 'regional', true, NOW(), NOW()),
('budget_export', 'Export budget reports', 'budget', 'export', 'regional', true, NOW(), NOW());

-- =====================================================
-- REGION PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('region_create', 'Create regions', 'region', 'create', 'global', true, NOW(), NOW()),
('region_read', 'View region information', 'region', 'read', 'global', true, NOW(), NOW()),
('region_update', 'Update region details', 'region', 'update', 'global', true, NOW(), NOW()),
('region_delete', 'Delete regions', 'region', 'delete', 'global', true, NOW(), NOW()),
('region_manage', 'Full region management', 'region', 'manage', 'global', true, NOW(), NOW());

-- =====================================================
-- UNIVERSITY PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('university_create', 'Create universities', 'university', 'create', 'regional', true, NOW(), NOW()),
('university_read', 'View university information', 'university', 'read', 'regional', true, NOW(), NOW()),
('university_update', 'Update university details', 'university', 'update', 'regional', true, NOW(), NOW()),
('university_delete', 'Delete universities', 'university', 'delete', 'global', true, NOW(), NOW()),
('university_manage', 'Full university management', 'university', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- SMALL GROUP PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('smallgroup_create', 'Create small groups', 'smallgroup', 'create', 'university', true, NOW(), NOW()),
('smallgroup_read', 'View small group information', 'smallgroup', 'read', 'university', true, NOW(), NOW()),
('smallgroup_update', 'Update small group details', 'smallgroup', 'update', 'university', true, NOW(), NOW()),
('smallgroup_delete', 'Delete small groups', 'smallgroup', 'delete', 'global', true, NOW(), NOW()),
('smallgroup_manage', 'Full small group management', 'smallgroup', 'manage', 'university', true, NOW(), NOW()),
('smallgroup_approve', 'Approve small group creation', 'smallgroup', 'approve', 'regional', true, NOW(), NOW());

-- =====================================================
-- ALUMNI SMALL GROUP PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('alumni_group_create', 'Create alumni small groups', 'alumni_group', 'create', 'regional', true, NOW(), NOW()),
('alumni_group_read', 'View alumni group information', 'alumni_group', 'read', 'regional', true, NOW(), NOW()),
('alumni_group_update', 'Update alumni group details', 'alumni_group', 'update', 'regional', true, NOW(), NOW()),
('alumni_group_delete', 'Delete alumni groups', 'alumni_group', 'delete', 'global', true, NOW(), NOW()),
('alumni_group_manage', 'Full alumni group management', 'alumni_group', 'manage', 'regional', true, NOW(), NOW()),
('alumni_group_approve', 'Approve alumni group creation', 'alumni_group', 'approve', 'regional', true, NOW(), NOW());

-- =====================================================
-- DOCUMENT PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('document_upload', 'Upload documents', 'document', 'upload', 'regional', true, NOW(), NOW()),
('document_read', 'View documents', 'document', 'read', 'regional', true, NOW(), NOW()),
('document_update', 'Update document details', 'document', 'update', 'regional', true, NOW(), NOW()),
('document_delete', 'Delete documents', 'document', 'delete', 'global', true, NOW(), NOW()),
('document_manage', 'Full document management', 'document', 'manage', 'regional', true, NOW(), NOW()),
('document_approve', 'Approve document uploads', 'document', 'approve', 'regional', true, NOW(), NOW());

-- =====================================================
-- APPROVAL REQUEST PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('approval_create', 'Create approval requests', 'approval', 'create', 'regional', true, NOW(), NOW()),
('approval_read', 'View approval requests', 'approval', 'read', 'regional', true, NOW(), NOW()),
('approval_update', 'Update approval requests', 'approval', 'update', 'regional', true, NOW(), NOW()),
('approval_delete', 'Delete approval requests', 'approval', 'delete', 'global', true, NOW(), NOW()),
('approval_review', 'Review approval requests', 'approval', 'review', 'regional', true, NOW(), NOW()),
('approval_approve', 'Approve requests', 'approval', 'approve', 'regional', true, NOW(), NOW()),
('approval_reject', 'Reject requests', 'approval', 'reject', 'regional', true, NOW(), NOW()),
('approval_manage', 'Full approval management', 'approval', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- USER MANAGEMENT PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('user_create', 'Create users', 'user', 'create', 'global', true, NOW(), NOW()),
('user_read', 'View user information', 'user', 'read', 'global', true, NOW(), NOW()),
('user_update', 'Update user information', 'user', 'update', 'global', true, NOW(), NOW()),
('user_delete', 'Delete users', 'user', 'delete', 'global', true, NOW(), NOW()),
('user_manage', 'Full user management', 'user', 'manage', 'global', true, NOW(), NOW()),
('user_activate', 'Activate/deactivate users', 'user', 'activate', 'global', true, NOW(), NOW()),
('user_reset_password', 'Reset user passwords', 'user', 'reset_password', 'global', true, NOW(), NOW());

-- =====================================================
-- ROLE MANAGEMENT PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('role_create', 'Create roles', 'role', 'create', 'global', true, NOW(), NOW()),
('role_read', 'View role information', 'role', 'read', 'global', true, NOW(), NOW()),
('role_update', 'Update role details', 'role', 'update', 'global', true, NOW(), NOW()),
('role_delete', 'Delete roles', 'role', 'delete', 'global', true, NOW(), NOW()),
('role_manage', 'Full role management', 'role', 'manage', 'global', true, NOW(), NOW()),
('role_assign', 'Assign roles to users', 'role', 'assign', 'global', true, NOW(), NOW()),
('role_permissions', 'Manage role permissions', 'role', 'permissions', 'global', true, NOW(), NOW());

-- =====================================================
-- PERMISSION MANAGEMENT PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('permission_create', 'Create permissions', 'permission', 'create', 'global', true, NOW(), NOW()),
('permission_read', 'View permission information', 'permission', 'read', 'global', true, NOW(), NOW()),
('permission_update', 'Update permission details', 'permission', 'update', 'global', true, NOW(), NOW()),
('permission_delete', 'Delete permissions', 'permission', 'delete', 'global', true, NOW(), NOW()),
('permission_manage', 'Full permission management', 'permission', 'manage', 'global', true, NOW(), NOW());

-- =====================================================
-- SYSTEM ADMINISTRATION PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('system_settings', 'Manage system settings', 'system', 'settings', 'global', true, NOW(), NOW()),
('system_audit', 'View audit logs', 'system', 'audit', 'global', true, NOW(), NOW()),
('system_backup', 'Manage data backup/restore', 'system', 'backup', 'global', true, NOW(), NOW()),
('system_maintenance', 'Perform system maintenance', 'system', 'maintenance', 'global', true, NOW(), NOW()),
('system_manage', 'Full system administration', 'system', 'manage', 'global', true, NOW(), NOW());

-- =====================================================
-- REPORT PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('report_membership', 'View membership reports', 'report', 'membership', 'regional', true, NOW(), NOW()),
('report_financial', 'View financial reports', 'report', 'financial', 'regional', true, NOW(), NOW()),
('report_engagement', 'View engagement reports', 'report', 'engagement', 'regional', true, NOW(), NOW()),
('report_attendance', 'View attendance reports', 'report', 'attendance', 'regional', true, NOW(), NOW()),
('report_export', 'Export reports', 'report', 'export', 'regional', true, NOW(), NOW()),
('report_manage', 'Full report management', 'report', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- NOTIFICATION PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('notification_create', 'Create notifications', 'notification', 'create', 'regional', true, NOW(), NOW()),
('notification_read', 'View notifications', 'notification', 'read', 'regional', true, NOW(), NOW()),
('notification_update', 'Update notifications', 'notification', 'update', 'regional', true, NOW(), NOW()),
('notification_delete', 'Delete notifications', 'notification', 'delete', 'global', true, NOW(), NOW()),
('notification_send', 'Send notifications', 'notification', 'send', 'regional', true, NOW(), NOW()),
('notification_manage', 'Full notification management', 'notification', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- AUDIT LOG PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('audit_read', 'View audit logs', 'audit', 'read', 'global', true, NOW(), NOW()),
('audit_export', 'Export audit logs', 'audit', 'export', 'global', true, NOW(), NOW()),
('audit_manage', 'Full audit log management', 'audit', 'manage', 'global', true, NOW(), NOW());

-- =====================================================
-- PAYMENT GATEWAY PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('payment_gateway_create', 'Create payment gateways', 'payment_gateway', 'create', 'global', true, NOW(), NOW()),
('payment_gateway_read', 'View payment gateway information', 'payment_gateway', 'read', 'global', true, NOW(), NOW()),
('payment_gateway_update', 'Update payment gateway details', 'payment_gateway', 'update', 'global', true, NOW(), NOW()),
('payment_gateway_delete', 'Delete payment gateways', 'payment_gateway', 'delete', 'global', true, NOW(), NOW()),
('payment_gateway_manage', 'Full payment gateway management', 'payment_gateway', 'manage', 'global', true, NOW(), NOW());

-- =====================================================
-- PAYMENT TRANSACTION PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('payment_transaction_read', 'View payment transactions', 'payment_transaction', 'read', 'regional', true, NOW(), NOW()),
('payment_transaction_update', 'Update payment transactions', 'payment_transaction', 'update', 'regional', true, NOW(), NOW()),
('payment_transaction_refund', 'Process payment refunds', 'payment_transaction', 'refund', 'global', true, NOW(), NOW()),
('payment_transaction_manage', 'Full payment transaction management', 'payment_transaction', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- MOVEMENT PERMISSIONS (Member transfers)
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('movement_create', 'Create member movements', 'movement', 'create', 'regional', true, NOW(), NOW()),
('movement_read', 'View member movements', 'movement', 'read', 'regional', true, NOW(), NOW()),
('movement_update', 'Update member movements', 'movement', 'update', 'regional', true, NOW(), NOW()),
('movement_delete', 'Delete member movements', 'movement', 'delete', 'global', true, NOW(), NOW()),
('movement_approve', 'Approve member movements', 'movement', 'approve', 'regional', true, NOW(), NOW()),
('movement_manage', 'Full movement management', 'movement', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- DASHBOARD PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('dashboard_view', 'View dashboard', 'dashboard', 'view', 'personal', true, NOW(), NOW()),
('dashboard_regional', 'View regional dashboard', 'dashboard', 'regional', 'regional', true, NOW(), NOW()),
('dashboard_national', 'View national dashboard', 'dashboard', 'national', 'global', true, NOW(), NOW()),
('dashboard_manage', 'Manage dashboard widgets', 'dashboard', 'manage', 'global', true, NOW(), NOW());

-- =====================================================
-- PROFILE PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('profile_read', 'View own profile', 'profile', 'read', 'personal', true, NOW(), NOW()),
('profile_update', 'Update own profile', 'profile', 'update', 'personal', true, NOW(), NOW()),
('profile_manage', 'Manage user profiles', 'profile', 'manage', 'global', true, NOW(), NOW());

-- =====================================================
-- CALENDAR PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('calendar_view', 'View calendar', 'calendar', 'view', 'regional', true, NOW(), NOW()),
('calendar_create', 'Create calendar events', 'calendar', 'create', 'regional', true, NOW(), NOW()),
('calendar_update', 'Update calendar events', 'calendar', 'update', 'regional', true, NOW(), NOW()),
('calendar_delete', 'Delete calendar events', 'calendar', 'delete', 'global', true, NOW(), NOW()),
('calendar_manage', 'Full calendar management', 'calendar', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- INBOX PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('inbox_read', 'Read inbox messages', 'inbox', 'read', 'personal', true, NOW(), NOW()),
('inbox_send', 'Send messages', 'inbox', 'send', 'regional', true, NOW(), NOW()),
('inbox_manage', 'Manage inbox', 'inbox', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- EMERGENCY PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('emergency_create', 'Create emergency alerts', 'emergency', 'create', 'regional', true, NOW(), NOW()),
('emergency_read', 'View emergency alerts', 'emergency', 'read', 'regional', true, NOW(), NOW()),
('emergency_update', 'Update emergency alerts', 'emergency', 'update', 'regional', true, NOW(), NOW()),
('emergency_delete', 'Delete emergency alerts', 'emergency', 'delete', 'global', true, NOW(), NOW()),
('emergency_manage', 'Full emergency management', 'emergency', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- IMPORT/EXPORT PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('import_members', 'Import member data', 'import', 'members', 'regional', true, NOW(), NOW()),
('import_contributions', 'Import contribution data', 'import', 'contributions', 'regional', true, NOW(), NOW()),
('export_members', 'Export member data', 'export', 'members', 'regional', true, NOW(), NOW()),
('export_contributions', 'Export contribution data', 'export', 'contributions', 'regional', true, NOW(), NOW()),
('export_reports', 'Export reports', 'export', 'reports', 'regional', true, NOW(), NOW()),
('import_manage', 'Full import management', 'import', 'manage', 'regional', true, NOW(), NOW()),
('export_manage', 'Full export management', 'export', 'manage', 'regional', true, NOW(), NOW());

-- =====================================================
-- VALIDATION PERMISSIONS
-- =====================================================
INSERT INTO permission (name, description, resource, action, scope, isActive, createdAt, updatedAt) VALUES
('validation_email', 'Validate email addresses', 'validation', 'email', 'global', true, NOW(), NOW()),
('validation_phone', 'Validate phone numbers', 'validation', 'phone', 'global', true, NOW(), NOW()),
('validation_manage', 'Manage validation rules', 'validation', 'manage', 'global', true, NOW(), NOW());

-- =====================================================
-- SUMMARY
-- =====================================================
-- Total permissions created: 150+ permissions covering all system resources
-- Scopes: global, regional, university, smallgroup, alumni_group, personal
-- Actions: create, read, update, delete, manage, approve, reject, export, import, etc.
-- Resources: All major system entities (members, trainings, contributions, etc.)

SELECT 
    COUNT(*) as total_permissions,
    scope,
    COUNT(*) as count_by_scope
FROM permission 
GROUP BY scope 
ORDER BY count_by_scope DESC; 