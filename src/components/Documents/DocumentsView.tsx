import React, { useState } from 'react';
import { FileText, Upload, Download, Eye, Trash2, Search, Filter, Plus, File, Image, Video, Archive } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Modal from '../UI/Modal';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  category: string;
  tags: string[];
  url: string;
  clientId?: string;
  leadId?: string;
  opportunityId?: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'TechCorp_Contract_2024.pdf',
    type: 'application/pdf',
    size: 2048576,
    uploadedAt: '2024-12-01T10:00:00Z',
    uploadedBy: 'John Smith',
    category: 'contracts',
    tags: ['contract', 'techcorp', '2024'],
    url: '#',
    clientId: '1'
  },
  {
    id: '2',
    name: 'Product_Presentation.pptx',
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 5242880,
    uploadedAt: '2024-11-28T14:30:00Z',
    uploadedBy: 'Sarah Wilson',
    category: 'presentations',
    tags: ['presentation', 'product', 'demo'],
    url: '#'
  },
  {
    id: '3',
    name: 'Lead_Analysis_Report.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 1048576,
    uploadedAt: '2024-11-25T09:15:00Z',
    uploadedBy: 'Mike Johnson',
    category: 'reports',
    tags: ['report', 'analysis', 'leads'],
    url: '#'
  }
];

export default function DocumentsView() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadCategory, setUploadCategory] = useState('general');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !categoryFilter || doc.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (type.includes('image')) return <Image className="w-6 h-6 text-blue-500" />;
    if (type.includes('video')) return <Video className="w-6 h-6 text-purple-500" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="w-6 h-6 text-yellow-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleUploadSubmit = () => {
    if (selectedFiles) {
      Array.from(selectedFiles).forEach(file => {
        const newDoc: Document = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Current User',
          category: uploadCategory,
          tags: [],
          url: URL.createObjectURL(file)
        };
        setDocuments(prev => [newDoc, ...prev]);
      });
      setIsUploadModalOpen(false);
      setSelectedFiles(null);
    }
  };

  const handleDeleteDocument = (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    }
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'presentations', label: 'Presentations' },
    { value: 'reports', label: 'Reports' },
    { value: 'proposals', label: 'Proposals' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'general', label: 'General' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            className="sm:w-80"
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={categoryOptions}
          />
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} icon={Upload}>
          Upload Document
        </Button>
      </div>

      {/* Documents Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(doc.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                        <p className="text-sm text-gray-500">{formatFileSize(doc.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => window.open(doc.url, '_blank')}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = doc.url;
                          link.download = doc.name;
                          link.click();
                        }}
                        className="text-gray-400 hover:text-green-600 transition-colors p-1"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Category: {doc.category}</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>Uploaded by: {doc.uploadedBy}</span>
                    </div>
                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <div className="text-gray-500">
                {searchTerm || categoryFilter ? 'No documents match your filters' : 'No documents found'}
              </div>
              {!searchTerm && !categoryFilter && (
                <Button onClick={() => setIsUploadModalOpen(true)} className="mt-4" icon={Upload}>
                  Upload Your First Document
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Documents"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Files
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop files here, or click to select
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                Choose Files
              </label>
            </div>
            {selectedFiles && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">Selected files:</p>
                <ul className="text-sm text-gray-800">
                  {Array.from(selectedFiles).map((file, index) => (
                    <li key={index}>
                      {file.name} ({formatFileSize(file.size)})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Select
            label="Category"
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            options={categoryOptions.filter(opt => opt.value !== '')}
          />

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUploadSubmit}
              disabled={!selectedFiles}
            >
              Upload Files
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}