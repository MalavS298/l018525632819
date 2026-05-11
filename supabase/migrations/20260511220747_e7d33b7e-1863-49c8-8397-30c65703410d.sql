-- Meetings: leads can manage
CREATE POLICY "Leads can manage meetings"
ON public.meetings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'lead'))
WITH CHECK (public.has_role(auth.uid(), 'lead'));

-- Meeting details: leads can manage
CREATE POLICY "Leads can manage meeting details"
ON public.meeting_details
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'lead'))
WITH CHECK (public.has_role(auth.uid(), 'lead'));

-- Newsletters: leads can create/update/delete
CREATE POLICY "Leads can create newsletters"
ON public.newsletters
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'lead'));

CREATE POLICY "Leads can update newsletters"
ON public.newsletters
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'lead'));

CREATE POLICY "Leads can delete newsletters"
ON public.newsletters
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'lead'));

-- Messages: leads can view all and update read status (to reply effectively)
CREATE POLICY "Leads can view all messages"
ON public.messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'lead'));

CREATE POLICY "Leads can update messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'lead'));

-- Message replies: leads can manage
CREATE POLICY "Leads can manage replies"
ON public.message_replies
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'lead'))
WITH CHECK (public.has_role(auth.uid(), 'lead'));