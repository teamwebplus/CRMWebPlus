import { useState } from 'react';
import { useLeads } from './useLeads';
import { useClients } from './useClients';
import { useActivities } from './useActivities';
import type { Database } from '../lib/supabase';

type Lead = Database['public']['Tables']['leads']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];

export function useLeadWorkflow() {
  const { updateLead } = useLeads();
  const { createClient } = useClients();
  const { createActivity } = useActivities();
  const [loading, setLoading] = useState(false);

  const convertLeadToClient = async (lead: Lead) => {
    setLoading(true);
    try {
      // Create new client from lead data
      const clientData: ClientInsert = {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        status: 'customer',
        value: lead.value,
        tags: ['converted-lead'],
        notes: `Converted from lead. Original notes: ${lead.notes}`,
        address: lead.address,
        website: lead.website,
        industry: lead.industry,
        source: lead.source,
        assigned_to: lead.assigned_to,
        created_by: lead.created_by
      };

      const { data: client, error: clientError } = await createClient(clientData);
      if (clientError) throw new Error(clientError);

      // Update lead status to converted
      const { error: leadError } = await updateLead(lead.id, { 
        status: 'converted',
        notes: `${lead.notes}\n\nConverted to client on ${new Date().toLocaleDateString()}`
      });
      if (leadError) throw new Error(leadError);

      // Create activity to track the conversion
      await createActivity({
        type: 'note',
        title: 'Lead Converted to Client',
        description: `Successfully converted lead ${lead.name} to client status`,
        lead_id: lead.id,
        client_id: client.id,
        completed: true
      });

      return { success: true, client, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Conversion failed';
      return { success: false, client: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const qualifyLead = async (leadId: string, score: number, notes: string) => {
    setLoading(true);
    try {
      const { error } = await updateLead(leadId, {
        status: 'qualified',
        score,
        notes
      });

      if (error) throw new Error(error);

      // Create activity for qualification
      await createActivity({
        type: 'note',
        title: 'Lead Qualified',
        description: `Lead qualified with score ${score}. Notes: ${notes}`,
        lead_id: leadId,
        completed: true
      });

      return { success: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Qualification failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const markLeadAsLost = async (leadId: string, reason: string) => {
    setLoading(true);
    try {
      const { error } = await updateLead(leadId, {
        status: 'lost',
        notes: `Lead marked as lost. Reason: ${reason}`
      });

      if (error) throw new Error(error);

      // Create activity for lost lead
      await createActivity({
        type: 'note',
        title: 'Lead Marked as Lost',
        description: `Lead marked as lost. Reason: ${reason}`,
        lead_id: leadId,
        completed: true
      });

      return { success: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    convertLeadToClient,
    qualifyLead,
    markLeadAsLost,
    loading
  };
}