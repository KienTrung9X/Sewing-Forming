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

-- Create defect_types table
CREATE TABLE defect_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE defect_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all" ON reports FOR ALL USING (true);
CREATE POLICY "Allow all" ON defect_types FOR ALL USING (true);
CREATE POLICY "Allow all" ON items FOR ALL USING (true);

-- Insert default data
INSERT INTO defect_types (name) VALUES 
  ('Lỗi hàn'),
  ('Lỗi bề mặt'),
  ('Lỗi kích thước');

INSERT INTO items (name) VALUES 
  ('Item A'),
  ('Item B'),
  ('Item C');
