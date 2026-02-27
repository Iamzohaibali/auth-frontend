import { useEffect, useState, useRef, useCallback } from 'react';
import { Users, Shield, Ban, BarChart3, Search, MoreVertical, Trash2, Key, UserCheck, UserX } from 'lucide-react';
import { adminAPI } from '../api';
import { Button, Badge, Input } from '../components/ui/FormElements';
import toast from 'react-hot-toast';

function SmartDropdown({ user: u, anchorEl, onClose, onBan, onDelete, onRole, onResetPw }) {
  const ref = useRef(null);
  const rect = anchorEl.getBoundingClientRect();
  const DROPDOWN_H = 220;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < DROPDOWN_H;

  const style = {
    position: 'fixed',
    right: window.innerWidth - rect.right,
    zIndex: 9999,
    ...(openUpward ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
  };

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !anchorEl.contains(e.target)) onClose();
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handler); };
  }, [onClose, anchorEl]);

  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [onClose]);

  const otherRoles = ['user', 'moderator', 'admin'].filter((r) => r !== u.role);

  return (
    <div ref={ref} style={style} className="w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 overflow-hidden">
      <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Change Role</p>
      {otherRoles.map((role) => (
        <button key={role} onClick={() => { onRole(u._id, role); onClose(); }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 capitalize transition-colors">
          Make {role}
        </button>
      ))}
      <hr className="my-1 border-gray-100" />
      <button onClick={() => { onResetPw(u._id); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <Key className="w-3.5 h-3.5 text-gray-400 shrink-0" /> Reset Password
      </button>
      <button onClick={() => { onBan(u._id, u.isBanned); onClose(); }}
        className={"w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors " + (u.isBanned ? "text-green-700 hover:bg-green-50" : "text-orange-600 hover:bg-orange-50")}>
        {u.isBanned ? <><UserCheck className="w-3.5 h-3.5 shrink-0" /> Unban User</> : <><UserX className="w-3.5 h-3.5 shrink-0" /> Ban User</>}
      </button>
      <hr className="my-1 border-gray-100" />
      <button onClick={() => { onDelete(u._id); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
        <Trash2 className="w-3.5 h-3.5 shrink-0" /> Delete User
      </button>
    </div>
  );
}

const AdminPage = () => {
  const [stats,          setStats]          = useState(null);
  const [users,          setUsers]          = useState([]);
  const [pagination,     setPagination]     = useState({});
  const [search,         setSearch]         = useState('');
  const [page,           setPage]           = useState(1);
  const [loading,        setLoading]        = useState(true);
  const [openMenuUser,   setOpenMenuUser]   = useState(null);
  const [anchorEl,       setAnchorEl]       = useState(null);
  const [resetPassModal, setResetPassModal] = useState(null);
  const [newPassword,    setNewPassword]    = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllUsers({ page, limit: 15, search: search || undefined }),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.data);
      setPagination(usersRes.data.pagination);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const closeMenu = useCallback(() => { setOpenMenuUser(null); setAnchorEl(null); }, []);

  const toggleMenu = (e, user) => {
    if (openMenuUser?._id === user._id) { closeMenu(); }
    else { setOpenMenuUser(user); setAnchorEl(e.currentTarget); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchData(); };

  const handleBan = async (userId, isBanned) => {
    try {
      if (isBanned) { await adminAPI.unbanUser(userId); toast.success('User unbanned'); }
      else { await adminAPI.banUser(userId, 'Admin action'); toast.success('User banned'); }
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try { await adminAPI.deleteUser(userId); toast.success('User deleted'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try { await adminAPI.updateUserRole(userId, newRole); toast.success('Role updated to ' + newRole); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Role update failed'); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    try {
      await adminAPI.resetPassword(resetPassModal, newPassword);
      toast.success('Password reset successfully');
      setResetPassModal(null); setNewPassword('');
    } catch (err) { toast.error(err.response?.data?.message || 'Reset failed'); }
  };

  const roleBadge = (role) => {
    if (role === 'admin') return <Badge variant="danger">Admin</Badge>;
    if (role === 'moderator') return <Badge variant="moderator">Moderator</Badge>;
    return <Badge variant="default">User</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <Badge variant="danger">Admin Panel</Badge>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',  value: stats.totalUsers,     icon: Users,    color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Active Users', value: stats.activeUsers,    icon: UserCheck,color: 'text-green-600',  bg: 'bg-green-50' },
            { label: 'Banned Users', value: stats.bannedUsers,    icon: Ban,      color: 'text-red-600',    bg: 'bg-red-50' },
            { label: 'This Month',   value: stats.usersThisMonth, icon: BarChart3,color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={"w-10 h-10 " + bg + " rounded-lg flex items-center justify-center mb-3"}>
                <Icon className={"w-5 h-5 " + color} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <h2 className="font-semibold text-gray-900 flex-1">All Users</h2>
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <Button type="submit" size="sm">Search</Button>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px]">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left w-12">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No users found</td></tr>
                )}
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar?.url ? (
                          <img src={u.avatar.url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-indigo-600">{u.firstName?.[0]}{u.lastName?.[0]}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{roleBadge(u.role)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {u.isBanned ? <Badge variant="danger">Banned</Badge>
                        : u.isActive ? <Badge variant="success">Active</Badge>
                        : <Badge variant="warning">Inactive</Badge>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={(e) => toggleMenu(e, u)}
                        className={"p-1.5 rounded-lg transition-colors " + (openMenuUser?._id === u._id ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-100 text-gray-500")}>
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-gray-500">{pagination.total} users · page {pagination.page}/{pagination.pages}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page === 1}               onClick={() => setPage(p => p - 1)}>Prev</Button>
              <Button size="sm" variant="secondary" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {openMenuUser && anchorEl && (
        <SmartDropdown user={openMenuUser} anchorEl={anchorEl} onClose={closeMenu}
          onBan={handleBan} onDelete={handleDelete} onRole={handleRoleChange}
          onResetPw={(id) => setResetPassModal(id)} />
      )}

      {resetPassModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-1">Reset User Password</h3>
            <p className="text-xs text-gray-500 mb-4">The user will log in with this new password.</p>
            <Input label="New Password (min 6 chars)" type="password" value={newPassword}
              onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleResetPassword} className="flex-1">Reset Password</Button>
              <Button variant="secondary" onClick={() => { setResetPassModal(null); setNewPassword(''); }} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;