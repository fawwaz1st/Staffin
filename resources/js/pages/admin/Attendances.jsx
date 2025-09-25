import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock } from 'lucide-react';

export default function AdminAttendances() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock size={22} /> Manajemen Absensi (Coming Soon)
        </h1>
        <Button variant="outline" disabled>
          Export CSV
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 dark:text-gray-400 py-8 text-center">
            Halaman ini akan menampilkan rekap absensi seluruh karyawan, filter tanggal, dan export.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
