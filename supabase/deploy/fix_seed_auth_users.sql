-- Create missing auth.users entries for seed profiles
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'sarah@eterrn.app',
   '{"username": "sarah_t", "display_name": "Sarah Thompson"}',
   NOW(), NOW(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000011', 'mike@eterrn.app',
   '{"username": "mike_r", "display_name": "Michael Rivera"}',
   NOW(), NOW(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000012', 'priya@eterrn.app',
   '{"username": "priya_o", "display_name": "Priya Okafor"}',
   NOW(), NOW(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000013', 'jenny@eterrn.app',
   '{"username": "jenny_c", "display_name": "Jennifer Chen"}',
   NOW(), NOW(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;
