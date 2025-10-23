import React from 'react';
import { TableProps, TableColumn } from '../../types/admin';

const Table = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className = '',
}: TableProps<T>) => {
  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        <div className="animate-pulse">
          <div className="bg-gray-800 px-6 py-4">
            <div className="flex space-x-4">
              {columns.map((_, index) => (
                <div key={index} className="h-4 bg-gray-700 rounded flex-1"></div>
              ))}
            </div>
          </div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="border-t border-gray-700 px-6 py-4">
              <div className="flex space-x-4">
                {columns.map((_, colIndex) => (
                  <div key={colIndex} className="h-4 bg-gray-700 rounded flex-1"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-gray-600 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3"
                      />
                    </svg>
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-800 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key as string}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                    >
                      {column.render
                        ? column.render(row[column.key], row, rowIndex)
                        : String(row[column.key] || '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;