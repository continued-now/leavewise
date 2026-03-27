'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  publishDate: string;
  scheduled: boolean;
  description: string;
  keywords: string[];
  content: string;
  fileName: string;
}

type View = 'list' | 'create' | 'edit';

const EMPTY_POST = {
  title: '',
  slug: '',
  date: new Date().toISOString().split('T')[0],
  publishDate: '',
  description: '',
  keywords: '',
  content: '',
};

export default function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [view, setView] = useState<View>('list');
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_POST);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [locale, setLocale] = useState<'en' | 'ko'>('en');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog?locale=${locale}`);
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch {
      showMessage('error', 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const autoSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      ...(view === 'create' ? { slug: autoSlug(title) } : {}),
    }));
  };

  const handleCreate = async () => {
    if (!form.title || !form.slug || !form.content) {
      showMessage('error', 'Title, slug, and content are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          publishDate: form.publishDate || undefined,
          keywords: form.keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showMessage('error', data.error ?? 'Failed to create post');
        return;
      }
      showMessage('success', `Post "${form.title}" created`);
      setForm(EMPTY_POST);
      setView('list');
      fetchPosts();
    } catch {
      showMessage('error', 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditSlug(post.slug);
    setForm({
      title: post.title,
      slug: post.slug,
      date: post.date,
      publishDate: post.publishDate && post.publishDate !== post.date ? post.publishDate : '',
      description: post.description,
      keywords: post.keywords.join(', '),
      content: post.content,
    });
    setView('edit');
  };

  const handleUpdate = async () => {
    if (!editSlug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/${editSlug}?locale=${locale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          date: form.date,
          publishDate: form.publishDate || undefined,
          description: form.description,
          keywords: form.keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          content: form.content,
          ...(form.slug !== editSlug ? { newSlug: form.slug } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showMessage('error', data.error ?? 'Failed to update post');
        return;
      }
      showMessage('success', `Post "${form.title}" updated`);
      setView('list');
      setEditSlug(null);
      fetchPosts();
    } catch {
      showMessage('error', 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/${slug}?locale=${locale}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showMessage('error', data.error ?? 'Failed to delete post');
        return;
      }
      showMessage('success', 'Post deleted');
      setDeleteConfirm(null);
      fetchPosts();
    } catch {
      showMessage('error', 'Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setView('list');
    setEditSlug(null);
    setForm(EMPTY_POST);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Blog Admin</h1>
          <p className="text-ink-muted text-sm mt-1">Manage your blog posts</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={locale}
            onChange={(e) => {
              setLocale(e.target.value as 'en' | 'ko');
              setView('list');
            }}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-teal/30"
          >
            <option value="en">English</option>
            <option value="ko">Korean</option>
          </select>
          {view === 'list' && (
            <button
              onClick={() => {
                setForm({ ...EMPTY_POST, date: new Date().toISOString().split('T')[0] });
                setView('create');
              }}
              className="bg-teal text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-teal-hover transition-colors"
            >
              + New Post
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === 'success'
              ? 'bg-sage-light text-sage border border-sage/20'
              : 'bg-coral-light text-coral border border-coral/20'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div>
          {loading && posts.length === 0 ? (
            <div className="text-center py-12 text-ink-muted">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-border">
              <p className="text-ink-muted mb-4">No blog posts yet</p>
              <button
                onClick={() => setView('create')}
                className="bg-teal text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-teal-hover transition-colors"
              >
                Create your first post
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.slug}
                  className="bg-white rounded-2xl border border-border p-5 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <time className="text-xs text-ink-muted font-semibold uppercase tracking-wide">
                        {post.date}
                      </time>
                      {post.scheduled && (
                        <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">
                          Scheduled {post.publishDate}
                        </span>
                      )}
                      {!post.scheduled && post.publishDate && post.publishDate !== post.date && (
                        <span className="text-[10px] font-semibold bg-sage-light text-sage border border-sage/20 px-1.5 py-0.5 rounded-full">
                          Live
                        </span>
                      )}
                      <span className="text-xs text-ink-muted">·</span>
                      <span className="text-xs text-ink-muted">{post.slug}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-ink truncate">
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="text-ink-soft text-sm mt-1 line-clamp-2">{post.description}</p>
                    )}
                    {post.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {post.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="text-xs bg-cream-dark text-ink-muted px-2 py-0.5 rounded-md"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={locale === 'ko' ? `/ko/blog/${post.slug}${post.scheduled ? '?preview=1' : ''}` : `/blog/${post.slug}${post.scheduled ? '?preview=1' : ''}`}
                      className="text-xs text-ink-muted hover:text-teal transition-colors px-2 py-1"
                      target="_blank"
                    >
                      {post.scheduled ? 'Preview' : 'View'}
                    </Link>
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-xs text-teal hover:text-teal-hover font-semibold transition-colors px-2 py-1"
                    >
                      Edit
                    </button>
                    {deleteConfirm === post.slug ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(post.slug)}
                          className="text-xs bg-coral text-white font-semibold px-2 py-1 rounded-md hover:bg-coral/90 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-ink-muted hover:text-ink px-2 py-1 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(post.slug)}
                        className="text-xs text-coral hover:text-coral/80 font-semibold transition-colors px-2 py-1"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Form */}
      {(view === 'create' || view === 'edit') && (
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold text-ink mb-6">
            {view === 'create' ? 'New Post' : 'Edit Post'}
          </h2>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Your post title"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink bg-cream/50 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/40 placeholder:text-ink-muted/50"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Slug
                <span className="font-normal text-ink-muted ml-1">(URL path)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-muted">/blog/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="your-post-slug"
                  className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm text-ink bg-cream/50 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/40 placeholder:text-ink-muted/50 font-mono"
                />
              </div>
            </div>

            {/* Date */}
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="border border-border rounded-xl px-4 py-2.5 text-sm text-ink bg-cream/50 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/40"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">
                  Publish Date
                  <span className="font-normal text-ink-muted ml-1">(leave empty = publish now)</span>
                </label>
                <input
                  type="date"
                  value={form.publishDate}
                  onChange={(e) => setForm((f) => ({ ...f, publishDate: e.target.value }))}
                  className="border border-border rounded-xl px-4 py-2.5 text-sm text-ink bg-cream/50 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/40"
                />
                {form.publishDate && form.publishDate > new Date().toISOString().split('T')[0] && (
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    This post will be hidden until {form.publishDate}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Description
                <span className="font-normal text-ink-muted ml-1">(SEO meta)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="A brief description for search engines and social sharing"
                rows={2}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink bg-cream/50 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/40 placeholder:text-ink-muted/50 resize-none"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Keywords
                <span className="font-normal text-ink-muted ml-1">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={form.keywords}
                onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                placeholder="PTO optimization, vacation planning, holiday bridge"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink bg-cream/50 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/40 placeholder:text-ink-muted/50"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Content
                <span className="font-normal text-ink-muted ml-1">(Markdown)</span>
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Write your post content in Markdown..."
                rows={20}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm text-ink bg-cream/50 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/40 placeholder:text-ink-muted/50 font-mono leading-relaxed resize-y"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={view === 'create' ? handleCreate : handleUpdate}
                disabled={loading}
                className="bg-teal text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-teal-hover transition-colors disabled:opacity-50"
              >
                {loading
                  ? 'Saving...'
                  : view === 'create'
                    ? 'Create Post'
                    : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="text-sm text-ink-muted hover:text-ink transition-colors px-4 py-2.5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
