import React, { useState, useRef, useEffect } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../ui';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  disabled = false,
  height = '300px',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const toolbarButtons = [
    { icon: BoldIcon, command: 'bold', title: 'Bold' },
    { icon: ItalicIcon, command: 'italic', title: 'Italic' },
    { icon: UnderlineIcon, command: 'underline', title: 'Underline' },
    { icon: ListBulletIcon, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: NumberedListIcon, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: LinkIcon, command: 'link', title: 'Insert Link', onClick: insertLink },
    { icon: PhotoIcon, command: 'image', title: 'Insert Image', onClick: insertImage },
  ];

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-800">
      {/* Toolbar */}
      <div className="flex items-center space-x-1 p-3 border-b border-gray-600 bg-gray-900">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.onClick || (() => execCommand(button.command))}
            disabled={disabled}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={button.title}
          >
            <button.icon className="w-4 h-4" />
          </button>
        ))}
        
        {/* Divider */}
        <div className="w-px h-6 bg-gray-600 mx-2" />
        
        {/* Format Dropdown */}
        <select
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          disabled={disabled}
          className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
        >
          <option value="div">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Paragraph</option>
          <option value="blockquote">Quote</option>
        </select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={() => setIsEditorFocused(true)}
        onBlur={() => setIsEditorFocused(false)}
        className={`
          p-4 text-white focus:outline-none overflow-y-auto
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
          ${!value && !isEditorFocused ? 'text-gray-400' : ''}
        `}
        style={{ height, minHeight: '200px' }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Character Count */}
      <div className="px-4 py-2 bg-gray-900 border-t border-gray-600 text-xs text-gray-400 flex justify-between">
        <span>
          {value.replace(/<[^>]*>/g, '').length} characters
        </span>
        <span className={isEditorFocused ? 'text-amber-400' : ''}>
          {isEditorFocused ? 'Editing' : 'Click to edit'}
        </span>
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.875rem 0;
        }
        
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        
        [contenteditable] p {
          margin: 0.5rem 0;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #F59E0B;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 2rem;
        }
        
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        
        [contenteditable] a {
          color: #F59E0B;
          text-decoration: underline;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;