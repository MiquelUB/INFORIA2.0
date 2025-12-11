-- Add google_sheet_url column to patients table
ALTER TABLE public.patients 
ADD COLUMN google_sheet_url TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_google_sheet_url ON public.patients(google_sheet_url);

-- Comment for documentation
COMMENT ON COLUMN public.patients.google_sheet_url IS 'Direct URL to the patient CRM Google Sheet - controlled by user, Inforia has zero knowledge of contents';
