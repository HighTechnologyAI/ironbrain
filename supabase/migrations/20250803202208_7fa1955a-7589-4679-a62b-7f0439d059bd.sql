-- Update demo profiles with real email addresses
UPDATE public.profiles 
SET full_name = 'alpay' 
WHERE full_name = 'alpi';

UPDATE public.profiles 
SET full_name = 'arbnika' 
WHERE full_name = 'miki';

UPDATE public.profiles 
SET full_name = 'ilo' 
WHERE full_name = 'ilo';

UPDATE public.profiles 
SET full_name = 'shevket' 
WHERE full_name = 'chef';

UPDATE public.profiles 
SET full_name = 'dany' 
WHERE full_name = 'dani';

UPDATE public.profiles 
SET full_name = 'zhan' 
WHERE full_name = 'jan';

UPDATE public.profiles 
SET full_name = 'oleksandr' 
WHERE full_name = 'alex';

UPDATE public.profiles 
SET full_name = 'peter' 
WHERE full_name = 'peter';

-- Note: The email mapping will be handled by the updated create-demo-users function