import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LibraryPage } from '@/features/library';

export default function LibraryRoutePage() {
  return (
    <ProtectedRoute>
      <LibraryPage />
    </ProtectedRoute>
  );
}
