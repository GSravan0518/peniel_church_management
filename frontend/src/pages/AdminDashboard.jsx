import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import api, { mediaUrl } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { eventTypeLabel } from '../data/eventTypes';

export default function AdminDashboard() {
  const { user, setUser } = useAuth();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('overview');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [avatarBusyId, setAvatarBusyId] = useState(null);
  const myAvatarRef = useRef(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'worship',
    image: null,
  });

  const load = () => api.get('/dashboard/admin').then((res) => setData(res.data));

  useEffect(() => {
    load().catch(() => {});
  }, []);

  // Keep the users list fresh while admin is on the Users tab
  useEffect(() => {
    if (tab !== 'users') return undefined;
    const id = setInterval(() => {
      load().catch(() => {});
    }, 12000);
    return () => clearInterval(id);
  }, [tab]);

  const uploadUserAvatar = async (userId, file, { isSelf = false } = {}) => {
    if (!file) return;
    setAvatarBusyId(userId);
    setMessage('');
    try {
      const body = new FormData();
      body.append('avatar', file);
      const { data: result } = await api.post(`/users/${userId}/avatar`, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(result.message || 'Profile picture updated.');
      if (isSelf && result.user) {
        setUser((prev) => ({ ...prev, ...result.user, id: result.user.id || prev?.id }));
      }
      await load();
      setTab('users');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Profile picture upload failed');
    } finally {
      setAvatarBusyId(null);
    }
  };

  const removeUserAvatar = async (userId, isSelf = false) => {
    setAvatarBusyId(userId);
    setMessage('');
    try {
      const { data: result } = await api.delete(`/users/${userId}/avatar`);
      setMessage(result.message || 'Profile picture removed.');
      if (isSelf) {
        setUser((prev) => ({ ...prev, avatar: '' }));
      }
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not remove profile picture');
    } finally {
      setAvatarBusyId(null);
    }
  };

  const onUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.image) {
      setMessage('Choose an image file to upload.');
      return;
    }
    setUploading(true);
    setMessage('');
    try {
      const body = new FormData();
      body.append('image', uploadForm.image);
      body.append('title', uploadForm.title);
      body.append('description', uploadForm.description);
      body.append('category', uploadForm.category);
      const { data: result } = await api.post('/gallery/upload', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(result.message || 'Picture uploaded.');
      setUploadForm({ title: '', description: '', category: 'worship', image: null });
      e.target.reset?.();
      load();
      setTab('gallery');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteGallery = async (id) => {
    await api.delete(`/gallery/${id}`);
    setMessage('Gallery item deleted.');
    load();
  };

  const markMessageRead = async (id) => {
    await api.patch(`/contact/${id}/read`);
    load();
  };

  if (!data) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page dashboard">
      <header className="page-banner">
        <h1>Admin Dashboard</h1>
        <p>
          Monitor the full website, manage users and requests, upload gallery pictures, and set
          profile pictures.
        </p>
      </header>

      <section className="section">
        <div className="section-inner">
          <div className="dash-tabs">
            {[
              'overview',
              'profile',
              'upload',
              'gallery',
              'users',
              'programs',
              'prayers',
              'messages',
            ].map((t) => (
              <button
                key={t}
                type="button"
                className={tab === t ? 'is-active' : ''}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {message && (
            <p
              className={`form-status ${
                /fail|could not|error|required|choose/i.test(message) ? 'error' : 'success'
              }`}
            >
              {message}
            </p>
          )}

          {tab === 'profile' && (
            <div className="dash-panel admin-profile-panel">
              <h2>My profile picture</h2>
              <p className="muted">Upload a photo for your admin account.</p>
              <div className="admin-profile-row">
                <div className="user-avatar large">
                  {user?.avatar ? (
                    <img src={mediaUrl(user.avatar)} alt={user.name} />
                  ) : (
                    <span>{(user?.name || 'A').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="admin-profile-actions">
                  <input
                    ref={myAvatarRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      const id = user?.id || user?._id;
                      if (file && id) uploadUserAvatar(id, file, { isSelf: true });
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={avatarBusyId === (user?.id || user?._id)}
                    onClick={() => myAvatarRef.current?.click()}
                  >
                    {avatarBusyId === (user?.id || user?._id)
                      ? 'Uploading…'
                      : 'Upload profile picture'}
                  </button>
                  {user?.avatar && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      disabled={avatarBusyId === (user?.id || user?._id)}
                      onClick={() => removeUserAvatar(user.id || user._id, true)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'overview' && (
            <>
              <div className="stat-row pastor-stats admin-stats">
                <div>
                  <strong>{data.stats.users}</strong>
                  <span>Total users</span>
                </div>
                <div>
                  <strong>{data.stats.believers}</strong>
                  <span>Believers</span>
                </div>
                <div>
                  <strong>{data.stats.newBelieversToday ?? 0}</strong>
                  <span>New (24h)</span>
                </div>
                <div>
                  <strong>{data.stats.pastors}</strong>
                  <span>Pastors</span>
                </div>
                <div>
                  <strong>{data.stats.gallery}</strong>
                  <span>Pictures</span>
                </div>
                <div>
                  <strong>{data.stats.pendingPrograms}</strong>
                  <span>Pending bookings</span>
                </div>
                <div>
                  <strong>{data.stats.pendingPrayers}</strong>
                  <span>Pending prayers</span>
                </div>
                <div>
                  <strong>{data.stats.unreadMessages}</strong>
                  <span>Unread messages</span>
                </div>
                <div>
                  <strong>{data.stats.calendar}</strong>
                  <span>Calendar events</span>
                </div>
              </div>
              <p className="muted">
                Use Profile to set your photo, Upload for gallery pictures, and Users to add profile
                pictures for any account.
              </p>
            </>
          )}

          {tab === 'upload' && (
            <form className="form-panel wide" onSubmit={onUpload}>
              <h2>Upload gallery picture</h2>
              <p className="muted">Images are stored on the server and saved in the database.</p>
              <div className="form-grid">
                <label>
                  Title
                  <input
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="Baptism Sunday"
                    required
                  />
                </label>
                <label>
                  Category
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  >
                    {['worship', 'events', 'community', 'missions', 'other'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="span-2">
                  Description
                  <textarea
                    rows="3"
                    value={uploadForm.description}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, description: e.target.value })
                    }
                  />
                </label>
                <label className="span-2">
                  Picture file
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    required
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, image: e.target.files?.[0] || null })
                    }
                  />
                </label>
              </div>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Uploading…' : 'Upload picture'}
              </button>
            </form>
          )}

          {tab === 'gallery' && (
            <div className="dash-panel">
              <h2>Gallery library</h2>
              <div className="admin-gallery-grid">
                {data.gallery.map((item) => (
                  <article key={item._id} className="admin-gallery-card">
                    <img src={mediaUrl(item.imageUrl)} alt={item.title} />
                    <div>
                      <strong>{item.title}</strong>
                      <p className="muted">{item.category}</p>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => deleteGallery(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {data.gallery.length === 0 && <p className="muted">No pictures yet.</p>}
            </div>
          )}

          {tab === 'users' && (
            <div className="dash-panel">
              <div className="section-head">
                <div>
                  <h2>All users</h2>
                  <p className="muted">
                    Believers who register at `/register` appear here automatically (newest first).
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => load().then(() => setMessage('Users list refreshed.'))}
                >
                  Refresh now
                </button>
              </div>
              <ul className="dash-list stacked user-avatar-list">
                {data.users.map((u) => {
                  const busy = avatarBusyId === u._id;
                  const isSelf = (user?.id || user?._id) === u._id;
                  const isNew =
                    Date.now() - new Date(u.createdAt).getTime() < 24 * 60 * 60 * 1000;
                  return (
                    <li key={u._id} className="user-manage-row">
                      <div className="user-manage-main">
                        <div className="user-avatar">
                          {u.avatar ? (
                            <img src={mediaUrl(u.avatar)} alt={u.name} />
                          ) : (
                            <span>{(u.name || '?').charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <strong>
                            {u.name} · {u.role}
                            {isNew ? <span className="tag new-user-tag"> New</span> : null}
                          </strong>
                          <p>
                            {u.email} · {u.phone}
                          </p>
                          <span className="muted">
                            Joined {format(new Date(u.createdAt), 'MMM d, yyyy · h:mm a')}
                          </span>
                        </div>
                      </div>
                      <div className="user-manage-actions">
                        <label className="btn btn-ghost btn-sm file-btn">
                          {busy ? 'Uploading…' : 'Upload photo'}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            hidden
                            disabled={busy}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadUserAvatar(u._id, file, { isSelf });
                              e.target.value = '';
                            }}
                          />
                        </label>
                        {u.avatar && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={busy}
                            onClick={() => removeUserAvatar(u._id, isSelf)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {tab === 'programs' && (
            <div className="dash-panel">
              <h2>Home program bookings</h2>
              <ul className="dash-list stacked">
                {data.programs.map((p) => (
                  <li key={p._id}>
                    <div>
                      <strong>
                        {eventTypeLabel(p.eventType)} · {p.name}
                      </strong>
                      <p>
                        {p.place} · {format(new Date(p.date), 'MMM d, yyyy')} · {p.time12h}
                      </p>
                    </div>
                    <span className={`status-pill ${p.status}`}>{p.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'prayers' && (
            <div className="dash-panel">
              <h2>Prayer requests</h2>
              <ul className="dash-list stacked">
                {data.prayers.map((p) => (
                  <li key={p._id}>
                    <div>
                      <strong>{p.name}</strong>
                      <p>{p.request}</p>
                    </div>
                    <span className={`status-pill ${p.status}`}>{p.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'messages' && (
            <div className="dash-panel">
              <h2>Contact messages</h2>
              <ul className="dash-list stacked">
                {data.messages.map((m) => (
                  <li key={m._id}>
                    <div>
                      <strong>
                        {m.name} · {m.subject}
                        {!m.isRead ? ' · Unread' : ''}
                      </strong>
                      <p>{m.message}</p>
                      <span className="muted">{m.email}</span>
                    </div>
                    {!m.isRead && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => markMessageRead(m._id)}
                      >
                        Mark read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
