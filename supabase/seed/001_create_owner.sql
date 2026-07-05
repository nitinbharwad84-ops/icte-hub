-- ============================================================
-- CREATE OWNER USER
-- ============================================================
-- Edit the email and password below BEFORE running.
-- Password is hashed using bcrypt via pgcrypto (crypt/gen_salt).
-- ============================================================

-- ⚠️ EDIT THESE VALUES
DO $$
DECLARE
  v_email TEXT := 'owner@ictehub.com';        -- ← Change this
  v_password TEXT := 'Owner@123456';          -- ← Change this
  v_name TEXT := 'Platform Owner';
  v_user_id UUID;
BEGIN
  -- Check if extension exists
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    RAISE NOTICE 'User with email % already exists. Skipping creation.', v_email;
    RETURN;
  END IF;

  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    v_email,
    crypt(v_password, gen_salt('bf')),
    now(),
    jsonb_build_object('name', v_name, 'role', 'owner'),
    now(),
    now(),
    '', '', '', ''
  )
  RETURNING id INTO v_user_id;

  -- The trigger on_auth_user_created should auto-create the public.users entry.
  -- If it doesn't (e.g., trigger not active), uncomment the fallback below:

  /*
  INSERT INTO public.users (id, name, email, password_hash, role, must_change_password)
  VALUES (v_user_id, v_name, v_email, crypt(v_password, gen_salt('bf')), 'owner', false)
  ON CONFLICT (id) DO NOTHING;
  */

  -- The trigger sets must_change_password = true by default.
  -- Override it for the owner so they land directly on the dashboard.
  UPDATE public.users SET must_change_password = false WHERE id = v_user_id;

  RAISE NOTICE 'Owner user created successfully: % (ID: %)', v_email, v_user_id;
END $$;
