import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { MessageThread } from '@/components/messages/MessageThread';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <ProtectedRoute>
      <ConversationInner params={params} />
    </ProtectedRoute>
  );
}

async function ConversationInner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <MessageThread conversationId={id} currentUserId={session.user.id} />
    </div>
  );
}
