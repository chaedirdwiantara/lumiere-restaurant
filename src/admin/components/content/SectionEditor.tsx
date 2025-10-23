import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { Button, Input, Modal, Card, Badge } from '../ui';
import RichTextEditor from './RichTextEditor';
import ContentPreview from './ContentPreview';
import { HomeSection } from '../../types/admin';

const sectionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['hero', 'about', 'services', 'gallery', 'contact', 'custom']),
  isVisible: z.boolean(),
  order: z.number(),
  settings: z.object({
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    backgroundImage: z.string().optional(),
    layout: z.enum(['default', 'centered', 'split', 'full-width']).optional(),
  }).optional(),
});

type SectionFormData = z.infer<typeof sectionSchema>;

interface SectionEditorProps {
  sections: HomeSection[];
  onSectionsChange: (sections: HomeSection[]) => void;
  isLoading?: boolean;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  sections,
  onSectionsChange,
  isLoading = false,
}) => {
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewSection, setPreviewSection] = useState<HomeSection | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
  });

  const watchedContent = watch('content', '');

  const openModal = (section?: HomeSection) => {
    if (section) {
      setEditingSection(section);
      reset({
        title: section.title,
        subtitle: section.subtitle || '',
        content: section.content,
        type: section.type,
        isVisible: section.isVisible,
        order: section.order,
        settings: section.settings || {},
      });
    } else {
      setEditingSection(null);
      reset({
        title: '',
        subtitle: '',
        content: '',
        type: 'custom',
        isVisible: true,
        order: sections.length,
        settings: {},
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
    reset();
  };

  const onSubmit = (data: SectionFormData) => {
    const newSection: HomeSection = {
      id: editingSection?.id || `section_${Date.now()}`,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    let updatedSections;
    if (editingSection) {
      updatedSections = sections.map(section =>
        section.id === editingSection.id ? newSection : section
      );
    } else {
      updatedSections = [...sections, newSection];
    }

    onSectionsChange(updatedSections);
    closeModal();
  };

  const deleteSection = (sectionId: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      const updatedSections = sections.filter(section => section.id !== sectionId);
      onSectionsChange(updatedSections);
    }
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, isVisible: !section.isVisible }
        : section
    );
    onSectionsChange(updatedSections);
  };

  const moveSectionUp = (index: number) => {
    if (index > 0) {
      const updatedSections = [...sections];
      [updatedSections[index], updatedSections[index - 1]] = 
      [updatedSections[index - 1], updatedSections[index]];
      
      // Update order values
      updatedSections.forEach((section, idx) => {
        section.order = idx;
      });
      
      onSectionsChange(updatedSections);
    }
  };

  const moveSectionDown = (index: number) => {
    if (index < sections.length - 1) {
      const updatedSections = [...sections];
      [updatedSections[index], updatedSections[index + 1]] = 
      [updatedSections[index + 1], updatedSections[index]];
      
      // Update order values
      updatedSections.forEach((section, idx) => {
        section.order = idx;
      });
      
      onSectionsChange(updatedSections);
    }
  };

  const getSectionTypeColor = (type: string) => {
    const colors = {
      hero: 'bg-red-500',
      about: 'bg-blue-500',
      services: 'bg-green-500',
      gallery: 'bg-purple-500',
      contact: 'bg-orange-500',
      custom: 'bg-gray-500',
    };
    return colors[type as keyof typeof colors] || colors.custom;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Home Page Sections</h2>
          <p className="text-gray-400 mt-1">
            Manage and organize your home page content sections
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            size="sm"
          >
            {showPreview ? <EyeSlashIcon className="w-4 h-4 mr-2" /> : <EyeIcon className="w-4 h-4 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button onClick={() => openModal()} disabled={isLoading}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sections List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Sections ({sections.length})</h3>
          
          {sections.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-400 mb-4">No sections created yet</div>
              <Button onClick={() => openModal()} variant="outline">
                <PlusIcon className="w-4 h-4 mr-2" />
                Create First Section
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {sections.map((section, index) => (
                <Card key={section.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => moveSectionUp(index)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUpIcon className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveSectionDown(index)}
                          disabled={index === sections.length - 1}
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDownIcon className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-white">{section.title}</h4>
                          <Badge
                            variant={section.type === 'hero' ? 'danger' : 'default'}
                            size="sm"
                          >
                            {section.type}
                          </Badge>
                          {!section.isVisible && (
                            <Badge variant="warning" size="sm">Hidden</Badge>
                          )}
                        </div>
                        {section.subtitle && (
                          <p className="text-sm text-gray-400">{section.subtitle}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {section.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPreviewSection(section)}
                        className="p-2 text-gray-400 hover:text-white rounded transition-colors"
                        title="Preview"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleSectionVisibility(section.id)}
                        className="p-2 text-gray-400 hover:text-white rounded transition-colors"
                        title={section.isVisible ? 'Hide' : 'Show'}
                      >
                        {section.isVisible ? (
                          <EyeIcon className="w-4 h-4" />
                        ) : (
                          <EyeSlashIcon className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => openModal(section)}
                        className="p-2 text-gray-400 hover:text-white rounded transition-colors"
                        title="Edit"
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="p-2 text-gray-400 hover:text-red-400 rounded transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div>
            <ContentPreview
              content={previewSection?.content || (sections.length > 0 ? sections[0].content : '')}
              title={previewSection ? `Preview: ${previewSection.title}` : 'Section Preview'}
              isVisible={showPreview}
              onToggleVisibility={() => setShowPreview(!showPreview)}
            />
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSection ? 'Edit Section' : 'Create New Section'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title"
              {...register('title')}
              error={errors.title?.message}
              placeholder="Section title"
            />
            
            <Input
              label="Subtitle (Optional)"
              {...register('subtitle')}
              error={errors.subtitle?.message}
              placeholder="Section subtitle"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Section Type
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="hero">Hero</option>
                <option value="about">About</option>
                <option value="services">Services</option>
                <option value="gallery">Gallery</option>
                <option value="contact">Contact</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Layout
              </label>
              <select
                {...register('settings.layout')}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="default">Default</option>
                <option value="centered">Centered</option>
                <option value="split">Split</option>
                <option value="full-width">Full Width</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  {...register('isVisible')}
                  className="rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500"
                />
                <span>Visible on site</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content
            </label>
            <RichTextEditor
              value={watchedContent}
              onChange={(value) => setValue('content', value)}
              placeholder="Enter section content..."
              height="300px"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-400">{errors.content.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {editingSection ? 'Update Section' : 'Create Section'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SectionEditor;