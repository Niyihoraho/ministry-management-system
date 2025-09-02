"use client";

import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import ComponentCard from "../../components/common/ComponentCard";
import FileInput from "../../components/input/FileInput";
import Label from "../../components/common/Label";

interface ImportResult {
  success: number;
  errors: Array<{ row: number; error: string; data?: any }>;
}

export default function MemberImportPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);



  const processExcelFile = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Get the first worksheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: "" 
          }) as any[][];
          
          if (jsonData.length < 2) {
            throw new Error('Excel file must contain at least a header row and one data row');
          }
          
          const headers = jsonData[0].map((h: any) => String(h).toLowerCase().trim());
          const members: any[] = [];

          // Process each data row
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.every(cell => !cell)) continue; // Skip empty rows
            
            const memberData: any = {};
            
            // Map Excel columns to member fields
            headers.forEach((header, index) => {
              const value = row[index] ? String(row[index]).trim() : '';
              
              switch (header) {
                case 'firstname':
                  memberData.firstname = value;
                  break;
                case 'secondname':
                  memberData.secondname = value;
                  break;
                case 'gender':
                  memberData.gender = value;
                  break;
                case 'birthdate':
                  memberData.birthdate = value;
                  break;
                case 'placeofbirthdistrict':
                  memberData.placeOfBirthDistrict = value;
                  break;
                case 'placeofbirthsector':
                  memberData.placeOfBirthSector = value;
                  break;
                case 'placeofbirthcell':
                  memberData.placeOfBirthCell = value;
                  break;
                case 'placeofbirthvillage':
                  memberData.placeOfBirthVillage = value;
                  break;
                case 'localchurch':
                  memberData.localChurch = value;
                  break;
                case 'email':
                  memberData.email = value;
                  break;
                case 'phone':
                  memberData.phone = value;
                  break;
                case 'type':
                  memberData.type = value;
                  break;
                case 'status':
                  memberData.status = value;
                  break;
                case 'regionid':
                  memberData.regionId = value ? Number(value) : null;
                  break;
                case 'universityid':
                  memberData.universityId = value ? Number(value) : null;
                  break;
                case 'smallgroupid':
                  memberData.smallGroupId = value ? Number(value) : null;
                  break;
                case 'alumnigroupid':
                  memberData.alumniGroupId = value ? Number(value) : null;
                  break;
                case 'graduationdate':
                  memberData.graduationDate = value;
                  break;
                case 'faculty':
                  memberData.faculty = value;
                  break;
                case 'professionalism':
                  memberData.professionalism = value;
                  break;
                case 'maritalstatus':
                  memberData.maritalStatus = value;
                  break;
              }
            });

            members.push(memberData);
          }

          if (members.length === 0) {
            throw new Error('No valid data rows found in Excel file');
          }

          // Send all members to the bulk import API using axios
          const response = await axios.post('/api/members/import', { members });
          setImportResult(response.data);
          
          // Show success message if import was successful
          if (response.data.success > 0) {
            setShowSuccessMessage(true);
            // Auto-hide success message after 5 seconds
            setTimeout(() => {
              setShowSuccessMessage(false);
            }, 5000);
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  };

  const processCSVFile = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n');
          
          if (lines.length < 2) {
            throw new Error('CSV file must contain at least a header row and one data row');
          }
          
          // Parse CSV manually for better control
          const headers = lines[0].split(',').map((h: any) => String(h).toLowerCase().trim().replace(/"/g, ''));
          const members: any[] = [];

          // Process each data row
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines
            
            // Simple CSV parsing - split by comma and handle quoted values
            const row = line.split(',').map((cell: string) => cell.trim().replace(/^"|"$/g, ''));
            
            if (row.length === 0 || row.every(cell => !cell)) continue; // Skip empty rows
            
            const memberData: any = {};
            
            // Map CSV columns to member fields
            headers.forEach((header, index) => {
              const value = row[index] ? String(row[index]).trim() : '';
              
              switch (header) {
                case 'firstname':
                  memberData.firstname = value;
                  break;
                case 'secondname':
                  memberData.secondname = value;
                  break;
                case 'gender':
                  memberData.gender = value;
                  break;
                case 'birthdate':
                  memberData.birthdate = value;
                  break;
                case 'placeofbirthdistrict':
                  memberData.placeOfBirthDistrict = value;
                  break;
                case 'placeofbirthsector':
                  memberData.placeOfBirthSector = value;
                  break;
                case 'placeofbirthcell':
                  memberData.placeOfBirthCell = value;
                  break;
                case 'placeofbirthvillage':
                  memberData.placeOfBirthVillage = value;
                  break;
                case 'localchurch':
                  memberData.localChurch = value;
                  break;
                case 'email':
                  memberData.email = value;
                  break;
                case 'phone':
                  memberData.phone = value;
                  break;
                case 'type':
                  memberData.type = value;
                  break;
                case 'status':
                  memberData.status = value;
                  break;
                case 'regionid':
                  memberData.regionId = value ? Number(value) : null;
                  break;
                case 'universityid':
                  memberData.universityId = value ? Number(value) : null;
                  break;
                case 'smallgroupid':
                  memberData.smallGroupId = value ? Number(value) : null;
                  break;
                case 'alumnigroupid':
                  memberData.alumniGroupId = value ? Number(value) : null;
                  break;
                case 'graduationdate':
                  memberData.graduationDate = value;
                  break;
                case 'faculty':
                  memberData.faculty = value;
                  break;
                case 'professionalism':
                  memberData.professionalism = value;
                  break;
                case 'maritalstatus':
                  memberData.maritalStatus = value;
                  break;
              }
            });

            members.push(memberData);
          }

          if (members.length === 0) {
            throw new Error('No valid data rows found in CSV file');
          }

          // Send all members to the bulk import API using axios
          const response = await axios.post('/api/members/import', { members });
          setImportResult(response.data);
          
          // Show success message if import was successful
          if (response.data.success > 0) {
            setShowSuccessMessage(true);
            // Auto-hide success message after 5 seconds
            setTimeout(() => {
              setShowSuccessMessage(false);
            }, 5000);
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const downloadTemplate = () => {
    const headers = [
      'firstname',
      'secondname', 
      'gender',
      'birthdate',
      'placeOfBirthDistrict',
      'placeOfBirthSector',
      'placeOfBirthCell',
      'placeOfBirthVillage',
      'localChurch',
      'email',
      'phone',
      'type',
      'status',
      'regionId',
      'universityId',
      'smallGroupId',
      'alumniGroupId',
      'graduationDate',
      'faculty',
      'professionalism',
      'maritalStatus'
    ];
    
    const sampleData = [
      'John',
      'Doe',
      'male',
      '1990-01-15',
      'Kigali',
      'Nyarugenge',
      'Cell A',
      'Village 1',
      'Local Church Name',
      'john.doe@email.com',
      '+250123456789',
      'student',
      'active',
      '1',
      '1',
      '',
      '',
      '2024-06-15',
      'Computer Science',
      'Software Engineer',
      'single'
    ];
    
    const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'member_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("Selected file:", file.name);
    setFileName(file.name);
    setIsProcessing(true);
    setImportResult(null);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv') {
        await processCSVFile(file);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        await processExcelFile(file);
      } else {
        throw new Error('Unsupported file format. Please use CSV or Excel files (.csv, .xlsx, .xls).');
      }
    } catch (error) {
      console.error('Import error:', error);
      
      let errorMessage = 'Unknown error occurred during import';
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          errorMessage = error.response.data?.error || 'Invalid data format in file';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error occurred during import';
        } else {
          errorMessage = error.response?.data?.error || error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setImportResult({
        success: 0,
        errors: [{ row: 0, error: errorMessage }]
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ComponentCard title="Member Import">
      <div>
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-4 p-4 bg-green-900/30 border border-green-700/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-300 font-medium">
                Import completed successfully! {importResult?.success} members have been imported.
              </span>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-400 hover:text-green-300"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <Label>Upload file</Label>
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download Template
          </button>
        </div>
        <FileInput 
          onChange={handleFileChange} 
          className="custom-class"
          accept=".csv,.xlsx,.xls"
        />
        
        {fileName && (
          <div className="mt-2 text-sm text-gray-300 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Selected: {fileName}
          </div>
        )}

        {isProcessing && (
          <div className="mt-3 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-sm text-gray-300">Processing file...</span>
          </div>
        )}

        {importResult && (
          <div className="mt-4 p-4 rounded-lg border border-gray-700 bg-gray-800">
            <h3 className="font-semibold text-white mb-3">Import Results</h3>
            <div className="space-y-3">
              {importResult.success > 0 && (
                <div className="text-green-400 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Successfully imported: {importResult.success} members
                </div>
              )}
              
              {importResult.errors.length > 0 && (
                <div>
                  <div className="text-red-400 font-medium text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Errors: {importResult.errors.length}
                  </div>
                  <div className="mt-3 max-h-40 overflow-y-auto space-y-2">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-xs text-red-300 bg-red-900/30 p-3 rounded-lg border border-red-700/50">
                        {error.row > 0 ? `Row ${error.row}: ` : ''}{error.error}
                      </div>
                    ))}
                    {importResult.errors.length > 10 && (
                      <div className="text-xs text-gray-400 italic">
                        ... and {importResult.errors.length - 10} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h4 className="font-medium text-white text-sm mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            File Format Requirements
          </h4>
          <div className="text-xs text-gray-200 space-y-3">
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="font-medium text-blue-300 mb-1">Supported formats:</p>
              <p className="text-gray-300">• CSV, Excel (.xlsx, .xls)</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="font-medium text-blue-300 mb-1">Required columns:</p>
              <p className="text-gray-300">• firstname, secondname, gender, type</p>
              <p className="text-gray-400 text-xs mt-1">Note: All other columns are optional</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="font-medium text-blue-300 mb-1">Optional columns:</p>
              <p className="text-gray-300">• birthdate, placeOfBirthDistrict, placeOfBirthSector, placeOfBirthCell, placeOfBirthVillage</p>
              <p className="text-gray-300">• localChurch, email, phone, status, regionId, universityId, smallGroupId, alumniGroupId</p>
              <p className="text-gray-300">• graduationDate, faculty, professionalism, maritalStatus</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="font-medium text-blue-300 mb-1">Field values:</p>
              <p className="text-gray-300">• gender: "male" or "female"</p>
              <p className="text-gray-300">• type: "student" or "alumni"</p>
              <p className="text-gray-300">• status: "active" or "inactive"</p>
              <p className="text-gray-300">• maritalStatus: "single" or "married"</p>
              <p className="text-gray-300">• dates: YYYY-MM-DD format (e.g., 1990-01-15)</p>
            </div>
            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-700/30">
              <p className="text-blue-300 font-medium">Note: Column names are case-insensitive</p>
              <p className="text-blue-200 text-xs mt-1">Use the "Download Template" button above to get a sample CSV file with the correct format</p>
            </div>
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}