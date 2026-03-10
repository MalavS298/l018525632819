
CREATE TABLE public.message_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.message_replies ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with replies
CREATE POLICY "Admins can manage replies" ON public.message_replies
  FOR ALL TO public
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can view replies on their own messages
CREATE POLICY "Users can view replies to their messages" ON public.message_replies
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_replies.message_id
      AND messages.user_id = auth.uid()
    )
  );
