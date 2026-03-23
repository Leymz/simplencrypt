import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wxoaqfelaqaowndgmeqm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4b2FxZmVsYXFhb3duZGdtZXFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzg2ODYsImV4cCI6MjA4OTc1NDY4Nn0.yqIALNdzNEdFGKNlAJ-bZROK4EYijy06cd3pSENgOPE";

export const supabase = createClient(supabaseUrl, supabaseKey);