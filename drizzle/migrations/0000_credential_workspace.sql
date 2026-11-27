CREATE TABLE public.profiles (id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, name text NOT NULL DEFAULT '', email text NOT NULL DEFAULT '', education text NOT NULL DEFAULT '', current_education text NOT NULL DEFAULT '', experience text NOT NULL DEFAULT '');
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profile_owner ON public.profiles FOR ALL TO authenticated USING (id=(select auth.uid())) WITH CHECK (id=(select auth.uid()));
CREATE FUNCTION public.create_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN INSERT INTO public.profiles(id,name,email) VALUES(NEW.id, coalesce(NEW.raw_user_meta_data->>'name',NEW.raw_user_meta_data->>'full_name',''),coalesce(NEW.email,'')); RETURN NEW; END; $$;
CREATE TRIGGER on_account_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_profile();
CREATE TABLE public.credentials (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid, title text NOT NULL, institution text NOT NULL, qualification_type text NOT NULL DEFAULT 'Diploma', award_date date, description text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','Under Review','Approved','Rejected')), feedback text NOT NULL DEFAULT '', document_path text, document_name text, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.credentials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credentials TO authenticated;
GRANT ALL ON public.credentials TO service_role;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY credential_samples ON public.credentials FOR SELECT TO anon USING (user_id IS NULL);
CREATE POLICY credential_read ON public.credentials FOR SELECT TO authenticated USING (user_id IS NULL OR user_id=(select auth.uid()));
CREATE POLICY credential_insert ON public.credentials FOR INSERT TO authenticated WITH CHECK(user_id=(select auth.uid()));
CREATE POLICY credential_update ON public.credentials FOR UPDATE TO authenticated USING(user_id=(select auth.uid())) WITH CHECK(user_id=(select auth.uid()));
CREATE POLICY credential_delete ON public.credentials FOR DELETE TO authenticated USING(user_id=(select auth.uid()));
CREATE INDEX credentials_owner ON public.credentials(user_id,created_at DESC);
CREATE TABLE public.skills (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid, title text NOT NULL, category text NOT NULL DEFAULT 'Professional', experience text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'Not Validated' CHECK(status IN ('Not Validated','Pending','Validated')), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.skills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY skill_samples ON public.skills FOR SELECT TO anon USING(user_id IS NULL);
CREATE POLICY skill_read ON public.skills FOR SELECT TO authenticated USING(user_id IS NULL OR user_id=(select auth.uid()));
CREATE POLICY skill_insert ON public.skills FOR INSERT TO authenticated WITH CHECK(user_id=(select auth.uid()));
CREATE POLICY skill_update ON public.skills FOR UPDATE TO authenticated USING(user_id=(select auth.uid())) WITH CHECK(user_id=(select auth.uid()));
CREATE POLICY skill_delete ON public.skills FOR DELETE TO authenticated USING(user_id=(select auth.uid()));
CREATE INDEX skills_owner ON public.skills(user_id,created_at DESC);
CREATE TABLE public.tasks (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid, title text NOT NULL, deadline date, priority text NOT NULL DEFAULT 'Medium' CHECK(priority IN ('Low','Medium','High')), status text NOT NULL DEFAULT 'To Do' CHECK(status IN ('To Do','In Progress','Completed')), description text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.tasks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY task_samples ON public.tasks FOR SELECT TO anon USING(user_id IS NULL);
CREATE POLICY task_read ON public.tasks FOR SELECT TO authenticated USING(user_id IS NULL OR user_id=(select auth.uid()));
CREATE POLICY task_insert ON public.tasks FOR INSERT TO authenticated WITH CHECK(user_id=(select auth.uid()));
CREATE POLICY task_update ON public.tasks FOR UPDATE TO authenticated USING(user_id=(select auth.uid())) WITH CHECK(user_id=(select auth.uid()));
CREATE POLICY task_delete ON public.tasks FOR DELETE TO authenticated USING(user_id=(select auth.uid()));
CREATE INDEX tasks_owner ON public.tasks(user_id,created_at DESC);
CREATE POLICY document_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='credential-documents' AND (storage.foldername(name))[1]=(select auth.uid())::text);
CREATE POLICY document_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='credential-documents' AND (storage.foldername(name))[1]=(select auth.uid())::text);
CREATE POLICY document_delete ON storage.objects FOR DELETE TO authenticated USING(bucket_id='credential-documents' AND (storage.foldername(name))[1]=(select auth.uid())::text);
INSERT INTO public.credentials(title,institution,qualification_type,award_date,status,feedback,description) VALUES
('Diploma in Public Administration','Garissa University','Diploma','2023-11-24','Approved','Illustrative approval, not an institutional verification.','Public Administration and Political Science'),
('Bachelor of Arts in Political Science','Garissa University','Degree',null,'Under Review','Illustrative review: current studies, qualification not yet awarded.','Currently enrolled'),
('Certificate in Protection & Safeguarding','Sample training provider','Certificate','2025-05-20','Approved','Illustrative approval only.','Sample credential'),
('Community Development Certificate','Sample training provider','Certificate','2025-09-10','Pending','Awaiting supporting documents in this sample.','Sample credential'),
('Humanitarian Response Training','Sample training provider','Certificate','2025-06-12','Approved','Illustrative approval only.','Sample credential'),
('Project Management Fundamentals','Sample training provider','Certificate','2026-02-10','Pending','Sample request awaiting review.','Sample credential'),
('Digital Literacy Certificate','Sample training provider','Certificate','2025-04-15','Approved','Illustrative approval only.','Sample credential'),
('Leadership Workshop','Sample training provider','Certificate','2025-08-14','Rejected','Sample feedback: document is incomplete. Upload the complete certificate.','Sample credential');
INSERT INTO public.skills(title,category,experience,status) VALUES('Community engagement','Professional','Protection Officer, HCRI','Validated'),('Report writing','Communication','Drafting protection and field reports','Validated'),('Public administration','Academic','Diploma studies at Garissa University','Pending'),('Research & analysis','Academic','Political science research','Not Validated'),('Case management','Professional','Protection case follow-up','Validated'),('Team collaboration','Interpersonal','Working with field teams','Validated');
INSERT INTO public.tasks(title,deadline,priority,status,description) VALUES('Upload supporting degree documents','2026-11-30','High','To Do','Attach current academic transcript'),('Follow up on credential review','2026-12-02','Medium','To Do','Check the recorded review status'),('Update professional experience','2026-12-05','Low','In Progress','Add recent HCRI experience'),('Submit safeguarding certificate','2026-11-25','Medium','Completed','Sample completed submission');