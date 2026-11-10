import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Star, Trash2 } from 'lucide-react'
import type { CategoryId, Product, ProductInput } from '@/types'
import { CATEGORIES } from '@/data/seed'
import { Field, Modal, ProductImage, Spinner } from '@/components/ui'
import { cn, slugify } from '@/lib/format'

interface FormValues {
  name: string
  sku: string
  categoryId: CategoryId
  price: string
  compareAtPrice: string
  stock: string
  lowStockThreshold: string
  shortDescription: string
  description: string
  features: string
  specs: string
  images: string[]
  isActive: boolean
  isFeatured: boolean
}
type Errors = Partial<Record<keyof FormValues, string>>

const toValues = (p?: Product): FormValues => ({
  name: p?.name ?? '',
  sku: p?.sku ?? '',
  categoryId: p?.categoryId ?? 'power-tools',
  price: p ? String(p.price) : '',
  compareAtPrice: p?.compareAtPrice ? String(p.compareAtPrice) : '',
  stock: p ? String(p.stock) : '',
  lowStockThreshold: p ? String(p.lowStockThreshold) : '10',
  shortDescription: p?.shortDescription ?? '',
  description: p?.description ?? '',
  features: p?.features.join('\n') ?? '',
  specs: p?.specs.map((s) => `${s.label}: ${s.value}`).join('\n') ?? '',
  images: p?.images ?? [],
  isActive: p?.isActive ?? true,
  isFeatured: p?.isFeatured ?? false,
})

const validate = (v: FormValues): Errors => {
  const e: Errors = {}
  if (v.name.trim().length < 3) e.name = 'Name must be at least 3 characters.'
  if (!/^[A-Z0-9-]{3,}$/i.test(v.sku.trim())) e.sku = 'Use letters, numbers and dashes (min 3).'
  const price = Number(v.price)
  if (!v.price || !Number.isFinite(price) || price <= 0) e.price = 'Enter a price greater than 0.'
  if (v.compareAtPrice && (!Number.isFinite(Number(v.compareAtPrice)) || Number(v.compareAtPrice) <= price)) e.compareAtPrice = 'MRP must be higher than the price.'
  if (v.stock === '' || !Number.isInteger(Number(v.stock)) || Number(v.stock) < 0) e.stock = 'Enter a whole number, 0 or more.'
  if (!Number.isInteger(Number(v.lowStockThreshold)) || Number(v.lowStockThreshold) < 0) e.lowStockThreshold = 'Enter a whole number.'
  if (v.shortDescription.trim().length < 10) e.shortDescription = 'Add a short summary (min 10 characters).'
  if (v.description.trim().length < 20) e.description = 'Add a description (min 20 characters).'
  if (v.images.length === 0) e.images = 'Upload at least one product image.'
  return e
}

/** Reads a local image file and downsizes it so it fits comfortably in localStorage. */
const readImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file (JPG, PNG or WebP).'))
    if (file.size > 8 * 1024 * 1024) return reject(new Error('Image must be smaller than 8 MB.'))
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the image.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('This image format is not supported.'))
      img.onload = () => {
        const max = 900
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })

export default function ProductFormModal({ open, product, onClose, onSubmit }: { open: boolean; product?: Product; onClose: () => void; onSubmit: (input: ProductInput) => Promise<void> }) {
  const [values, setValues] = useState<FormValues>(toValues(product))
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setValues(toValues(product))
      setErrors({})
      setTouched(false)
      setUploadError(null)
    }
  }, [open, product])

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    const next = { ...values, [key]: value }
    setValues(next)
    if (touched) setErrors(validate(next))
  }

  const text = (key: keyof FormValues) => ({
    id: `pf-${key}`,
    value: values[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(key, e.target.value as never),
    className: 'input',
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `pf-${key}-error` : undefined,
  })

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setUploadError(null)
    try {
      const urls = await Promise.all(Array.from(files).slice(0, 4).map(readImage))
      set('images', [...values.images, ...urls].slice(0, 6))
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const submit = async () => {
    setTouched(true)
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await onSubmit({
        name: values.name.trim(),
        slug: slugify(values.name),
        sku: values.sku.trim().toUpperCase(),
        categoryId: values.categoryId,
        price: Math.round(Number(values.price)),
        compareAtPrice: values.compareAtPrice ? Math.round(Number(values.compareAtPrice)) : undefined,
        stock: Number(values.stock),
        lowStockThreshold: Number(values.lowStockThreshold),
        shortDescription: values.shortDescription.trim(),
        description: values.description.trim(),
        features: values.features.split('\n').map((s) => s.trim()).filter(Boolean),
        specs: values.specs
          .split('\n')
          .map((line) => line.split(':'))
          .filter((parts) => parts.length >= 2 && parts[0].trim())
          .map(([label, ...rest]) => ({ label: label.trim(), value: rest.join(':').trim() })),
        images: values.images,
        imageNote: product?.imageNote && product.images.join() === values.images.join() ? product.imageNote : undefined,
        isActive: values.isActive,
        isFeatured: values.isFeatured,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={product ? 'Edit product' : 'Add new product'}
      size="lg"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={saving || uploading}>
            {saving && <Spinner className="h-4 w-4" />} {product ? 'Save changes' : 'Create product'}
          </button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
        noValidate
        className="space-y-6"
      >
        {touched && Object.keys(errors).length > 0 && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            Please fix the highlighted fields.
          </p>
        )}

        {/* Images */}
        <div>
          <p className="label">Product images</p>
          <div className="flex flex-wrap gap-3">
            {values.images.map((src, i) => (
              <div key={i} className={cn('group relative h-24 w-24 overflow-hidden rounded-xl border-2', i === 0 ? 'border-navy-900' : 'border-slate-200')}>
                <ProductImage src={src} alt={`Product image ${i + 1}`} className="h-full w-full" />
                {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-navy-900 px-1.5 py-0.5 text-[10px] font-bold text-white">Main</span>}
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-navy-950/60 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
                  {i > 0 && (
                    <button type="button" className="rounded bg-white p-1.5 text-navy-900" aria-label={`Make image ${i + 1} the main image`} onClick={() => set('images', [src, ...values.images.filter((_, j) => j !== i)])}>
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button type="button" className="rounded bg-white p-1.5 text-red-600" aria-label={`Remove image ${i + 1}`} onClick={() => set('images', values.images.filter((_, j) => j !== i))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {values.images.length < 6 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={cn('flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs font-medium transition', errors.images ? 'border-red-400 text-red-600' : 'border-slate-300 text-slate-500 hover:border-navy-500 hover:text-navy-700')}
                disabled={uploading}
              >
                {uploading ? <Spinner /> : <ImagePlus className="h-6 w-6" aria-hidden />}
                Upload
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} aria-label="Upload product images" tabIndex={-1} />
          {(uploadError || errors.images) && <p className="field-error">{uploadError ?? errors.images}</p>}
          <p className="mt-1.5 text-xs text-slate-500">Local preview only. Images are resized and stored in this browser for the demo.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Product name" htmlFor="pf-name" error={errors.name}>
              <input {...text('name')} data-autofocus />
            </Field>
          </div>
          <Field label="SKU" htmlFor="pf-sku" error={errors.sku}>
            <input {...text('sku')} placeholder="VNT-XXXX" />
          </Field>
          <Field label="Category" htmlFor="pf-categoryId">
            <select {...text('categoryId')}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Demo price (₹)" htmlFor="pf-price" error={errors.price}>
            <input {...text('price')} type="number" min={1} inputMode="numeric" />
          </Field>
          <Field label="MRP (₹, optional)" htmlFor="pf-compareAtPrice" error={errors.compareAtPrice} hint="Shown as a strike-through price.">
            <input {...text('compareAtPrice')} type="number" min={1} inputMode="numeric" />
          </Field>
          <Field label="Stock quantity" htmlFor="pf-stock" error={errors.stock}>
            <input {...text('stock')} type="number" min={0} inputMode="numeric" />
          </Field>
          <Field label="Low-stock threshold" htmlFor="pf-lowStockThreshold" error={errors.lowStockThreshold}>
            <input {...text('lowStockThreshold')} type="number" min={0} inputMode="numeric" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Short description" htmlFor="pf-shortDescription" error={errors.shortDescription}>
              <input {...text('shortDescription')} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Full description" htmlFor="pf-description" error={errors.description}>
              <textarea {...text('description')} rows={4} />
            </Field>
          </div>
          <Field label="Features" htmlFor="pf-features" hint="One feature per line.">
            <textarea {...text('features')} rows={5} />
          </Field>
          <Field label="Specifications" htmlFor="pf-specs" hint='One per line, e.g. "Power: 300 W".'>
            <textarea {...text('specs')} rows={5} />
          </Field>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-navy-900">
            <input type="checkbox" checked={values.isActive} onChange={(e) => set('isActive', e.target.checked)} className="h-4 w-4 accent-navy-900" />
            Active (visible in store)
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-navy-900">
            <input type="checkbox" checked={values.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} className="h-4 w-4 accent-navy-900" />
            Featured on home page
          </label>
        </div>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  )
}
