-- Core Module 0.1: Common CRUD and relationship queries

-- 1. Retrieve a user's roles across all organisations
SELECT o.name AS organisation_name, r.name AS role_name
FROM user_organisations uo
JOIN organisations o ON o.id = uo.organisation_id
JOIN roles r ON r.id = uo.role_id
WHERE uo.user_id = :user_id;

-- 2. Fetch all members of a specific organisation with their roles
SELECT u.id, u.email, u.name, u.image, r.name AS role_name, uo.is_default, uo.created_at
FROM user_organisations uo
JOIN users u ON u.id = uo.user_id
JOIN roles r ON r.id = uo.role_id
WHERE uo.organisation_id = :organisation_id
ORDER BY uo.created_at;

-- 3. Update an organisation's profile details
UPDATE organisations
SET
  name = COALESCE(:name, name),
  company_size = COALESCE(:company_size, company_size),
  industry = COALESCE(:industry, industry),
  revenue = COALESCE(:revenue, revenue),
  geography = COALESCE(:geography, geography),
  employee_count = COALESCE(:employee_count, employee_count),
  metadata = COALESCE(:metadata, metadata),
  updated_at = NOW()
WHERE id = :id
RETURNING *;

-- 4. Insert a new user and associate them with an organisation
WITH new_user AS (
  INSERT INTO users (email, name, password_hash, provider, provider_id)
  VALUES (:email, :name, :password_hash, :provider, :provider_id)
  RETURNING id
)
INSERT INTO user_organisations (user_id, organisation_id, role_id, is_default)
SELECT new_user.id, :organisation_id, :role_id, TRUE
FROM new_user
RETURNING *;

-- 5. Retrieve all organisations a specific user belongs to
SELECT o.*, r.name AS role_name, uo.is_default
FROM user_organisations uo
JOIN organisations o ON o.id = uo.organisation_id
JOIN roles r ON r.id = uo.role_id
WHERE uo.user_id = :user_id
ORDER BY uo.is_default DESC, o.name;

-- CRUD: Get user by id
SELECT * FROM users WHERE id = :id;

-- CRUD: Get organisation by id
SELECT * FROM organisations WHERE id = :id;

-- CRUD: Create organisation
INSERT INTO organisations (name, slug, company_size, industry, revenue, geography, employee_count, metadata)
VALUES (:name, :slug, :company_size, :industry, :revenue, :geography, :employee_count, :metadata)
RETURNING *;

-- CRUD: Delete organisation (cascade will remove user_organisations and invitations)
DELETE FROM organisations WHERE id = :id;

-- List pending invitations for an organisation
SELECT i.*, r.name AS role_name
FROM invitations i
JOIN roles r ON r.id = i.role_id
WHERE i.organisation_id = :organisation_id AND i.accepted_at IS NULL AND i.expires_at > NOW();

-- Accept invitation: create user_organisations from invitation
INSERT INTO user_organisations (user_id, organisation_id, role_id, is_default)
SELECT :user_id, i.organisation_id, i.role_id, FALSE
FROM invitations i
WHERE i.token = :token AND i.accepted_at IS NULL AND i.expires_at > NOW()
RETURNING *;

-- Mark invitation accepted
UPDATE invitations SET accepted_at = NOW() WHERE token = :token;
