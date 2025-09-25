import React from 'react';

export default function DataTable({ columns = [], rows = [], loading = false, emptyText = 'Tidak ada data', footer, className = '' }) {
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">{emptyText}</div>;
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((col) => (
              <th key={col.key || col.accessor} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {rows.map((row, idx) => (
            <tr key={row.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              {columns.map((col) => (
                <td key={col.key || col.accessor} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {footer}
    </div>
  );
}
