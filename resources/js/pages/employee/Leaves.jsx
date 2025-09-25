import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Plus } from 'lucide-react';

export default function EmployeeLeaves() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText size={22} /> Pengajuan Cuti
        </h1>
        <Button className="inline-flex items-center gap-2">
          <Plus size={16} /> Ajukan Cuti
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Cuti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 dark:text-gray-400 py-8 text-center">
            Belum ada pengajuan. (stub)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
