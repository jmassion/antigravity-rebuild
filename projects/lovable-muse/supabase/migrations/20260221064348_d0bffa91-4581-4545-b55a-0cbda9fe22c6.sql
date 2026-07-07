
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  conversation_id UUID NOT NULL DEFAULT gen_random_uuid(),
  role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL DEFAULT '',
  tool_calls JSONB,
  tool_results JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own messages" ON public.chat_messages
  FOR ALL USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE INDEX idx_chat_messages_owner_conversation ON public.chat_messages (owner_id, conversation_id, created_at);
