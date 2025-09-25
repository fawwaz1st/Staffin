import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import StatusBadge from './StatusBadge';
import RoleDropdown from './RoleDropdown';
import Modal from '@/components/ui/Modal';
import { approveUser, rejectUser, deleteUser } from '@/api/admin/users';
import { toast } from 'react-hot-toast';

export default function UserCard({ user, onChanged, onRemoved }) {
  const [openReject, setOpenReject] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const doApprove = async () => {
    setLoading(true);
    try {
      const res = await approveUser(user.id);
      toast.success('User disetujui');
      onChanged?.(res.user);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menyetujui user');
    } finally {
      setLoading(false);
    }
  };

  const doReject = async () => {
    setLoading(true);
    try {
      const res = await rejectUser(user.id);
      toast.success('User ditolak');
      onChanged?.(res.user);
      setOpenReject(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menolak user');
    } finally {
      setLoading(false);
    }
  };

  const doDelete = async () => {
    setLoading(true);
    try {
      await deleteUser(user.id);
      toast.success('User dihapus');
      onRemoved?.(user);
      setOpenDelete(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menghapus user');
    } finally {
      setLoading(false);
    }
  };

  const created = new Date(user.created_at);
  const canApprove = user.status === 'pending';
  const canReject = user.status !== 'rejected';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-ink-600">{user.name}</h3>
              <StatusBadge status={user.status} />
            </div>
            <div className="text-sm text-[#6B6B6B]">{user.email}</div>
            <div className="text-xs text-[#9A9A9A] mt-1">Daftar: {created.toLocaleDateString()}</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <RoleDropdown user={user} onChanged={onChanged} disabled={loading} />
            <div className="flex items-center gap-2">
              <button
                onClick={doApprove}
                disabled={!canApprove || loading}
                className="rounded-xl px-3 py-1.5 text-sm font-semibold text-white shadow-soft transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 bg-emerald-600 hover:bg-emerald-500"
              >
                Approve
              </button>
              <button
                onClick={() => setOpenReject(true)}
                disabled={!canReject || loading}
                className="rounded-xl px-3 py-1.5 text-sm font-semibold text-white shadow-soft transition-all focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60 bg-rose-500 hover:bg-rose-400"
              >
                Reject
              </button>
              <button
                onClick={() => setOpenDelete(true)}
                disabled={loading}
                className="rounded-xl px-3 py-1.5 text-sm font-semibold text-coffee border border-coffee/40 bg-soft/60 transition-all hover:bg-soft focus:outline-none focus:ring-2 focus:ring-coffee/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </CardContent>

      <Modal
        open={openReject}
        onClose={() => setOpenReject(false)}
        title="Tolak Pendaftaran?"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={doReject} className="px-3 py-1.5 rounded-lg bg-red-600 text-white">Tolak</button>
            <button onClick={() => setOpenReject(false)} className="px-3 py-1.5 rounded-lg bg-black-100">Batal</button>
          </div>
        }
      >
        <p className="text-sm text-ink-600">Anda yakin ingin menolak akun <b>{user.email}</b>?</p>
      </Modal>

      <Modal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Hapus User?"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={doDelete} className="px-3 py-1.5 rounded-lg bg-red-600 text-white">Hapus</button>
            <button onClick={() => setOpenDelete(false)} className="px-3 py-1.5 rounded-lg bg-gray-100">Batal</button>
          </div>
        }
      >
        <p className="text-sm text-ink-600">Tindakan ini tidak dapat dibatalkan.</p>
      </Modal>
    </Card>
  );
}
