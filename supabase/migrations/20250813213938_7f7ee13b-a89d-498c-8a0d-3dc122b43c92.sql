-- Create translations cache table
CREATE TABLE public.translations_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_text TEXT NOT NULL,
  source_lang TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index to prevent duplicate translations
CREATE UNIQUE INDEX idx_translations_cache_unique 
ON public.translations_cache (md5(source_text), source_lang, target_lang);

-- Create index for faster lookups
CREATE INDEX idx_translations_cache_lookup 
ON public.translations_cache (source_lang, target_lang);

-- Enable RLS
ALTER TABLE public.translations_cache ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read cached translations (they're just translations)
CREATE POLICY "Anyone can read translations cache" 
ON public.translations_cache 
FOR SELECT 
USING (true);

-- Allow authenticated users to insert new translations
CREATE POLICY "Authenticated users can insert translations" 
ON public.translations_cache 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);