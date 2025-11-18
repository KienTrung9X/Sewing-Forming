-- Create reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item TEXT NOT NULL,
  model TEXT NOT NULL,
  lot_no TEXT NOT NULL,
  forming_machine_name TEXT NOT NULL,
  qty_ng INTEGER NOT NULL,
  unit TEXT DEFAULT 'pcs',
  machine_name TEXT NOT NULL,
  defect_type TEXT NOT NULL,
  reporter TEXT NOT NULL,
  occurrence_date DATE NOT NULL,
  shift TEXT NOT NULL,
  notes TEXT,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Chờ xử lý',
  root_cause TEXT,
  action TEXT,
  pic TEXT,
  deadline DATE,
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_occurrence_date ON reports(occurrence_date);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations" ON reports FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
