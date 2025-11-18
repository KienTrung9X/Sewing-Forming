-- Insert sample report data
INSERT INTO reports (
  item, 
  model, 
  lot_no, 
  forming_machine_name, 
  qty_ng, 
  unit, 
  machine_name, 
  defect_type, 
  reporter, 
  occurrence_date, 
  shift, 
  notes, 
  images, 
  status
) VALUES (
  'Item A',
  'PR-001',
  'LOT-2024-001',
  'Forming Machine 1',
  50,
  'pcs',
  'Sewing Machine 1',
  'Lỗi hàn',
  'Nguyễn Văn A',
  CURRENT_DATE,
  'Ca 1',
  'Lỗi phát hiện trong quá trình kiểm tra',
  '{}',
  'Chờ xử lý'
);
