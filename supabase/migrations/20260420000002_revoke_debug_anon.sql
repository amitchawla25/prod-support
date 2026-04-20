-- Remove anonymous access to the debug schema-introspection function.
-- This function was granted to 'anon' which allowed unauthenticated users
-- to enumerate table names, column types, and constraints — a reconnaissance risk.
REVOKE EXECUTE ON FUNCTION public.get_table_info(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_table_info(text) FROM authenticated;
