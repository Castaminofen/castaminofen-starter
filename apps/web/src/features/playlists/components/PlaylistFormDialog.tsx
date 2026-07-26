'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import type { PlaylistFormValues } from '../types';

export function PlaylistFormDialog({
  open,
  mode,
  initialValues,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: PlaylistFormValues;
  onClose: () => void;
  onSubmit: (values: PlaylistFormValues) => Promise<void> | void;
  isSubmitting: boolean;
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PlaylistFormValues>({
    defaultValues: initialValues ?? { title: '', description: '', imageUrl: '', isPublic: false },
  });

  useEffect(() => {
    if (open) {
      reset(initialValues ?? { title: '', description: '', imageUrl: '', isPublic: false });
    }
  }, [initialValues, open, reset]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="playlist-dialog-title">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-surface-primary p-5 shadow-soft sm:p-6">
        <div className="mb-4 space-y-1">
          <h2 id="playlist-dialog-title" className="text-subheading">
            {mode === 'create' ? 'ایجاد لیست پخش' : 'ویرایش لیست پخش'}
          </h2>
          <p className="text-caption">برای حفظ ساده و کاربرپسند، فقط عنوان و توضیحات اصلی لازم است.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-field">
            <label className="form-label" htmlFor="playlist-title">عنوان</label>
            <input className="input" id="playlist-title" {...register('title', { required: 'عنوان الزامی است.' })} />
            {errors.title ? <p className="error-text">{errors.title.message}</p> : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="playlist-description">توضیحات</label>
            <textarea className="textarea" id="playlist-description" rows={4} {...register('description')} />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="playlist-image-url">آدرس تصویر</label>
            <input className="input" id="playlist-image-url" {...register('imageUrl')} />
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" {...register('isPublic')} />
            عمومی شود
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              انصراف
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'در حال ذخیره...' : mode === 'create' ? 'ایجاد' : 'ذخیره'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
