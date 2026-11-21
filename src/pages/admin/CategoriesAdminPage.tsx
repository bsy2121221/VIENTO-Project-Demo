import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, Pencil, Plus } from 'lucide-react'
import { AdminPageHeader } from '@/components/layout/AdminLayout'
import { CATEGORY_COLORS, CATEGORY_ICON_MAP, CategoryBubble } from '@/components/marketplace'
import { ErrorState, Field, Modal, PageLoader, Spinner } from '@/components/ui'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/format'
import { CATEGORY_ICONS, type Category, type CategoryIcon } from '@/types'

export default function CategoriesAdminPage() {
  const { categories, products, sellers, loading, error, reload, updateCategory } = useStore()
  const toast = useToast()
  const [editing, setEditing] = useState<Category | 'new' | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const counts = useMemo(() => {
    const m = new Map<string, { products: number; sellers: number }>()
    for (const c of categories)
      m.set(c.id, {
        products: products.filter((p) => p.categoryId === c.id).length,
        sellers: sellers.filter((s) => s.status === 'approved' && s.categoryIds.includes(c.id)).length,
      })
    return m
  }, [categories, products, sellers])

  if (error) return <ErrorState message={error} onRetry={reload} />
  if (loading) return <PageLoader label="Loading categories…" />

  const run = async (id: string, fn: () => Promise<unknown>, success?: [string, string]) => {
    setBusyId(id)
    try {
      await fn()
      if (success) toast.success(...success)
    } catch (e) {
      toast.error('Update failed', e instanceof Error ? e.message : undefined)
    } finally {
      setBusyId(null)
    }
  }

  /** Swap display order with the neighbour above or below. */
  const move = (index: number, dir: -1 | 1) => {
    const a = categories[index]
    const b = categories[index + dir]
    if (!b) return
    void run(a.id, async () => {
      await updateCategory(a.id, { sortOrder: b.sortOrder })
      await updateCategory(b.id, { sortOrder: a.sortOrder })
    })
  }

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description={`${categories.filter((c) => c.isActive).length} visible of ${categories.length} · order here is the order shown on the storefront`}
        actions={
          <button className="btn btn-primary" onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" aria-hidden /> Add category
          </button>
        }
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="w-20 px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 text-right font-medium">Products</th>
                <th className="px-5 py-3 text-right font-medium">Sellers</th>
                <th className="px-5 py-3 font-medium">Storefront</th>
                <th className="px-5 py-3 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c, i) => {
                const n = counts.get(c.id)
                return (
                  <tr key={c.id} className={cn('hover:bg-slate-50/70', !c.isActive && 'bg-slate-50/60 text-slate-400')}>
                    <td className="px-5 py-3">
                      <div className="flex gap-0.5">
                        <button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-navy-900 disabled:opacity-30" disabled={i === 0 || !!busyId} onClick={() => move(i, -1)} aria-label={`Move ${c.name} up`}>
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-navy-900 disabled:opacity-30" disabled={i === categories.length - 1 || !!busyId} onClick={() => move(i, 1)} aria-label={`Move ${c.name} down`}>
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className={cn('flex min-w-64 items-center gap-3', !c.isActive && 'opacity-60')}>
                        <CategoryBubble category={c} size="sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-navy-900">{c.name}</p>
                          <p className="line-clamp-1 max-w-md text-xs text-slate-500">{c.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{n?.products ?? 0}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{n?.sellers ?? 0}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={busyId === c.id}
                        onClick={() => run(c.id, () => updateCategory(c.id, { isActive: !c.isActive }), c.isActive ? ['Category hidden', `${c.name} and its products are hidden from the storefront.`] : ['Category visible', `${c.name} is now on the storefront.`])}
                        className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition', c.isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 ring-slate-300 hover:bg-slate-200')}
                        aria-label={`${c.name} is ${c.isActive ? 'visible' : 'hidden'}. Toggle`}
                      >
                        {busyId === c.id ? <Spinner className="h-3.5 w-3.5" /> : c.isActive ? <Eye className="h-3.5 w-3.5" aria-hidden /> : <EyeOff className="h-3.5 w-3.5" aria-hidden />}
                        {c.isActive ? 'Visible' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        {c.isActive && (
                          <Link to={`/collections/${c.id}`} target="_blank" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy-900" aria-label={`View ${c.name} in store`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                        <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy-900" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}>
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryFormModal category={editing === 'new' ? undefined : (editing ?? undefined)} open={editing !== null} onClose={() => setEditing(null)} />
    </>
  )
}

function CategoryFormModal({ open, category, onClose }: { open: boolean; category?: Category; onClose: () => void }) {
  const { categories, createCategory, updateCategory } = useStore()
  const toast = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(CATEGORY_COLORS[0])
  const [icon, setIcon] = useState<CategoryIcon>('shopping-bag')
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(category?.name ?? '')
    setDescription(category?.description ?? '')
    setColor(category?.color ?? CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length])
    setIcon(category?.icon ?? 'shopping-bag')
    setErrors({})
  }, [open, category, categories.length])

  const save = async () => {
    const e: typeof errors = {}
    if (name.trim().length < 2) e.name = 'Enter a category name.'
    if (description.trim().length < 10) e.description = 'Add a short description (min 10 characters).'
    setErrors(e)
    if (Object.keys(e).length) return
    setSaving(true)
    try {
      if (category) {
        await updateCategory(category.id, { name: name.trim(), description: description.trim(), color, icon })
        toast.success('Category updated', name.trim())
      } else {
        const sortOrder = Math.max(0, ...categories.map((c) => c.sortOrder)) + 1
        await createCategory({ name: name.trim(), description: description.trim(), color, icon, isActive: true, sortOrder })
        toast.success('Category created', `${name.trim()} is now on the storefront.`)
      }
      onClose()
    } catch (err) {
      toast.error('Could not save category', err instanceof Error ? err.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? 'Edit category' : 'Add category'}
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
            {saving && <Spinner className="h-4 w-4" />} {category ? 'Save changes' : 'Create category'}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: `${color}12` }}>
          <CategoryBubble category={{ color, icon }} />
          <div>
            <p className="font-bold" style={{ color }}>
              {name.trim() || 'Category name'}
            </p>
            <p className="text-xs text-slate-500">Preview</p>
          </div>
        </div>
        <Field label="Name" htmlFor="cat-name" error={errors.name}>
          <input id="cat-name" className="input" value={name} onChange={(e) => setName(e.target.value)} data-autofocus aria-invalid={errors.name ? true : undefined} />
        </Field>
        <Field label="Description" htmlFor="cat-description" error={errors.description} hint="Shown at the top of the category page.">
          <textarea id="cat-description" rows={2} className="input" value={description} onChange={(e) => setDescription(e.target.value)} aria-invalid={errors.description ? true : undefined} />
        </Field>
        <fieldset>
          <legend className="label">Colour</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-pressed={color === c}
                aria-label={`Colour ${c}`}
                className={cn('h-8 w-8 rounded-full ring-offset-2 transition', color === c ? 'ring-2 ring-navy-900' : 'hover:scale-110')}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="label">Icon</legend>
          <div className="grid grid-cols-8 gap-2">
            {CATEGORY_ICONS.map((key) => {
              const Icon = CATEGORY_ICON_MAP[key]
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  aria-pressed={icon === key}
                  aria-label={`Icon ${key}`}
                  className={cn('flex h-10 items-center justify-center rounded-lg border transition', icon === key ? 'border-transparent text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}
                  style={icon === key ? { backgroundColor: color } : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </button>
              )
            })}
          </div>
        </fieldset>
      </div>
    </Modal>
  )
}
