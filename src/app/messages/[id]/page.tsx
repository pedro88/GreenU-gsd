import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { MessageThread } from '@/components/messages/MessageThread';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

/**
 * Message conversation page — /messages/[id]
 * Protected route showing a message thread for a specific conversation.
 * @param root0 - Props object
 * @param root0.params - Route parameters containing the conversation ID
 * @returns The conversation page JSX
 */
export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute>
      <ConversationInner params={params} />
    </ProtectedRoute>
  );
}

/**
 * Inner server component that fetches the conversation and renders the message thread.
 * @param root0 - Props object
 * @param root0.params - Route parameters containing the conversation ID
 * @returns The message thread component JSX
 */
async function ConversationInner({ params }: { params: Promise<{ id: string }> }) {
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
