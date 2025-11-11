import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../context/ReportContext';
import { DefectType } from '../types';
import ImagePreview from '../components/ImagePreview';

const OTHER_OPTION = "Khác...";

const CreateReportPage: React.FC = () => {
  const { addReport, defectTypes, addDefectType, items, addItem } = useReports();
  const navigate = useNavigate();

  const [reporter, setReporter] = useState('');
  const [occurrenceDate, setOccurrenceDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<'Ca 1' | 'Ca 2' | 'Ca 3'>('Ca 1');
  const [item, setItem] = useState(items[0] || '');
  const [customItem, setCustomItem] = useState('');
  const [machineName, setMachineName] = useState('');
  const [formingMachineName, setFormingMachineName] = useState('');
  const [model, setModel] = useState('');
  const [lotNo, setLotNo] = useState('');
  const [qtyNg, setQtyNg] = useState<number>(1);
  const [defectType, setDefectType] = useState(defectTypes[0] || '');
  const [customDefectType, setCustomDefectType] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (images.length + files.length > 5) {
        setError("Bạn chỉ có thể tải lên tối đa 5 ảnh.");
        return;
      }

      const imagePromises: Promise<string>[] = files.map((file: File) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(imagePromises)
        .then(base64Images => {
          setImages(prevImages => [...prevImages, ...base64Images]);
        })
        .catch(err => console.error("Error reading files:", err));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };
  
  const handleItemChange = (value: string) => {
    setItem(value);
    if (value !== OTHER_OPTION) {
        setCustomItem('');
    }
  }

  const handleDefectTypeChange = (value: string) => {
    setDefectType(value);
    if (value !== DefectType.OTHER) {
        setCustomDefectType('');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim() || !lotNo.trim() || !machineName.trim() || !reporter.trim() || !formingMachineName.trim() || qtyNg <= 0 || images.length === 0) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc: Người nhập lỗi, Item, Tên máy Sewing, Tên máy Forming, Model, Mã lô, Số lượng NG (>0), và tải lên ít nhất 1 ảnh.');
      return;
    }
    
    let finalItem = item;
    if (item === OTHER_OPTION) {
      if (!customItem.trim()) {
        setError('Vui lòng nhập mô tả cho Item "Khác".');
        return;
      }
      finalItem = customItem.trim();
      addItem(finalItem);
    }

    let finalDefectType = defectType;
    if (defectType === DefectType.OTHER) {
        if (!customDefectType.trim()) {
            setError('Vui lòng nhập mô tả cho loại lỗi "Khác".');
            return;
        }
        finalDefectType = customDefectType.trim();
        addDefectType(finalDefectType);
    }

    setError('');
    setIsSubmitting(true);

    try {
      const newReport = addReport({
        item: finalItem,
        machineName,
        formingMachineName,
        model,
        lotNo,
        qtyNg,
        defectType: finalDefectType,
        images,
        notes,
        reporter,
        occurrenceDate,
        shift,
      });
      setTimeout(() => {
        setIsSubmitting(false);
        navigate(`/report/${newReport.id}`);
      }, 500);
    } catch (err) {
      console.error(err);
      setError('Đã có lỗi xảy ra khi tạo báo cáo.');
      setIsSubmitting(false);
    }
  };

  const inputFieldClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Tạo Báo cáo Lỗi NG mới</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md dark:bg-red-900/50 dark:border-red-700 dark:text-red-300">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="reporter" className={labelClasses}>Người nhập lỗi <span className="text-red-500">*</span></label>
            <input type="text" id="reporter" value={reporter} onChange={e => setReporter(e.target.value)} className={inputFieldClasses} placeholder="VD: Nguyễn Văn A" required/>
          </div>
          <div>
            <label htmlFor="occurrenceDate" className={labelClasses}>Ngày phát sinh <span className="text-red-500">*</span></label>
            <input type="date" id="occurrenceDate" value={occurrenceDate} onChange={e => setOccurrenceDate(e.target.value)} className={inputFieldClasses} required/>
          </div>
          <div className="md:col-span-2">
            <label className={labelClasses}>Ca phát sinh <span className="text-red-500">*</span></label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['Ca 1', 'Ca 2', 'Ca 3'] as const).map((option) => (
                <label key={option} className={`
                  cursor-pointer rounded-md py-2 px-4 text-sm font-medium border
                  transition-colors duration-200
                  ${shift === option 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600'}
                `}>
                  <input
                    type="radio"
                    name="shift"
                    value={option}
                    checked={shift === option}
                    onChange={() => setShift(option)}
                    className="sr-only"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 border-t border-gray-200 dark:border-slate-700 pt-6"></div>
          <div>
            <label htmlFor="item" className={labelClasses}>Item <span className="text-red-500">*</span></label>
            <select id="item" value={item} onChange={e => handleItemChange(e.target.value)} className={inputFieldClasses}>
              {items.map(i => <option key={i} value={i}>{i}</option>)}
              <option value={OTHER_OPTION}>{OTHER_OPTION}</option>
            </select>
            {item === OTHER_OPTION && (
              <div className="mt-4">
                <label htmlFor="customItem" className={labelClasses}>Nhập Item mới <span className="text-red-500">*</span></label>
                <input type="text" id="customItem" value={customItem} onChange={e => setCustomItem(e.target.value)} className={inputFieldClasses} required />
              </div>
            )}
          </div>
           <div>
            <label htmlFor="machineName" className={labelClasses}>Tên máy Sewing <span className="text-red-500">*</span></label>
            <input type="text" id="machineName" value={machineName} onChange={e => setMachineName(e.target.value)} className={inputFieldClasses} required/>
          </div>
          <div>
            <label htmlFor="model" className={labelClasses}>Model <span className="text-red-500">*</span></label>
            <input type="text" id="model" value={model} onChange={e => setModel(e.target.value)} className={inputFieldClasses} required/>
          </div>
          <div>
            <label htmlFor="lotNo" className={labelClasses}>Mã lô Forming <span className="text-red-500">*</span></label>
            <input type="text" id="lotNo" value={lotNo} onChange={e => setLotNo(e.target.value)} className={inputFieldClasses} required/>
          </div>
          <div>
            <label htmlFor="formingMachineName" className={labelClasses}>Tên máy Forming <span className="text-red-500">*</span></label>
            <input type="text" id="formingMachineName" value={formingMachineName} onChange={e => setFormingMachineName(e.target.value)} className={inputFieldClasses} required/>
          </div>
          <div>
            <label htmlFor="qtyNg" className={labelClasses}>Số lượng NG <span className="text-red-500">*</span></label>
            <input type="number" id="qtyNg" value={qtyNg} onChange={e => setQtyNg(Number(e.target.value))} className={inputFieldClasses} min="1" required/>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="defectType" className={labelClasses}>Loại lỗi <span className="text-red-500">*</span></label>
            <select id="defectType" value={defectType} onChange={e => handleDefectTypeChange(e.target.value)} className={inputFieldClasses}>
              {defectTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {defectType === DefectType.OTHER && (
                <div className="mt-4">
                    <label htmlFor="customDefectType" className={labelClasses}>Mô tả loại lỗi khác <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        id="customDefectType" 
                        value={customDefectType} 
                        onChange={e => setCustomDefectType(e.target.value)} 
                        className={inputFieldClasses}
                        placeholder="VD: Lỗi dính bẩn"
                        required
                    />
                </div>
            )}
          </div>
        </div>
        
        <div>
          <label className={labelClasses}>Hình ảnh lỗi <span className="text-red-500">*</span></label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 dark:focus-within:ring-offset-slate-800">
                  <span>Tải lên file ảnh</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} />
                </label>
                <p className="pl-1">hoặc kéo thả vào đây</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF. Tối đa 5 ảnh.</p>
            </div>
          </div>
          <ImagePreview images={images} onRemoveImage={handleRemoveImage} />
        </div>
        
        <div>
          <label htmlFor="notes" className={labelClasses}>Ghi chú (tùy chọn)</label>
          <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={inputFieldClasses} />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => navigate(-1)} disabled={isSubmitting} className="py-2 px-4 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
            Hủy
          </button>
          <button type="submit" disabled={isSubmitting} className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Đang gửi...' : 'Gửi Báo cáo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReportPage;