
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { CalendarClock, Clock, DollarSign, Zap, ClipboardCheck, Pencil } from "lucide-react";
import { Button } from "../../components/ui/button";
import { HelpRequest, technicalAreaOptions, communicationOptions } from "../../types/helpRequest";
import { useAuth } from "../../contexts/auth";
import { Input } from "../ui/input";
import { updateHelpRequest } from "../../integrations/supabase/helpRequestsCore/updateHelpRequest";
import { supabase } from "../../integrations/supabase/client";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

interface TicketSidebarProps {
  ticket: HelpRequest;
  canSubmitQA: boolean;
  onSubmitQA: () => void;
  formatDate: (dateString?: string) => string;
  onTicketUpdated?: (t: HelpRequest) => void;
}

const editableStatuses = ["submitted", "pending_match", "dev_requested"];

const TicketSidebar: React.FC<TicketSidebarProps> = ({
  ticket,
  canSubmitQA,
  onSubmitQA,
  formatDate,
  onTicketUpdated
}) => {
  const { userId, userType } = useAuth();

  // --- Editing logic ---
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(() => ({
    description: ticket.description || "",
    technical_area: ticket.technical_area || [],
    complexity_level: ticket.complexity_level || "",
    communication_preference: ticket.communication_preference || [],
  }));
  const [saving, setSaving] = useState(false);

  const canEdit =
    userType === "client" &&
    editableStatuses.includes(ticket.status || "");

  // Track field changes for diff
  const handleFieldChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Build a JSON object of changed fields: { field: { old, new } }
  const getChangedFields = () => {
    const diff: Record<string, any> = {};
    if (formData.description !== (ticket.description || "")) {
      diff.description = { old: ticket.description || "", new: formData.description };
    }
    if (
      JSON.stringify(formData.technical_area) !==
      JSON.stringify(ticket.technical_area || [])
    ) {
      diff.technical_area = { old: ticket.technical_area || [], new: formData.technical_area };
    }
    if (formData.complexity_level !== (ticket.complexity_level || "")) {
      diff.complexity_level = { old: ticket.complexity_level || "", new: formData.complexity_level };
    }
    if (
      JSON.stringify(formData.communication_preference) !==
      JSON.stringify(ticket.communication_preference || [])
    ) {
      diff.communication_preference = { old: ticket.communication_preference || [], new: formData.communication_preference };
    }
    return diff;
  };

  const handleEdit = () => {
    setFormData({
      description: ticket.description || "",
      technical_area: ticket.technical_area || [],
      complexity_level: ticket.complexity_level || "",
      communication_preference: ticket.communication_preference || [],
    });
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const handleSave = async () => {
    const changedFields = getChangedFields();
    if (Object.keys(changedFields).length === 0) {
      toast.info("No changes to save.");
      setEditMode(false);
      return;
    }

    setSaving(true);
    try {
      // 1. Update ticket
      const updates: any = {};
      for (const key of Object.keys(changedFields)) {
        updates[key] = formData[key as keyof typeof formData];
      }
      const result = await updateHelpRequest(
        ticket.id!,
        updates,
        "client"
      );
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to update ticket");
      }

      // 2. Insert into help_request_history
      await supabase.from("help_request_history").insert([
        {
          help_request_id: ticket.id,
          change_type: 'field_edit',
          changed_by: userId,
          change_details: changedFields,
        },
      ]);

      toast.success("Ticket updated!");
      setEditMode(false);
      if (onTicketUpdated) {
        // Fix: Cast the result.data to HelpRequest type to ensure it has all required properties
        onTicketUpdated(result.data as HelpRequest);
      }
    } catch (err: any) {
      toast.error(`Failed to update: ${err.message || err}`);
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  // For checkbox array fields (multi-select)
  const toggleArrayValue = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Time and budget information</CardDescription>
          </div>
          {canEdit && !editMode && (
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {editMode ? (
            <form
              className="space-y-5"
              onSubmit={e => { e.preventDefault(); handleSave(); }}
            >
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={e => handleFieldChange("description", e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Technical Areas</label>
                <div className="flex flex-wrap gap-2">
                  {technicalAreaOptions.map(opt => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.technical_area.includes(opt)}
                        onChange={() =>
                          handleFieldChange(
                            "technical_area",
                            toggleArrayValue(formData.technical_area, opt)
                          )
                        }
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Complexity Level</label>
                <Input
                  value={formData.complexity_level}
                  onChange={e => handleFieldChange("complexity_level", e.target.value)}
                  placeholder="e.g. Easy, Medium, Hard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Communication Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {communicationOptions.map(opt => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.communication_preference.includes(opt)}
                        onChange={() =>
                          handleFieldChange(
                            "communication_preference",
                            toggleArrayValue(formData.communication_preference, opt)
                          )
                        }
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4" />
                  Request Submitted
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(ticket.created_at)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Estimated Duration
                </h3>
                <p className="text-sm text-muted-foreground">
                  {ticket.estimated_duration} hour{ticket.estimated_duration !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  Budget Range
                </h3>
                <p className="text-sm text-muted-foreground">
                  {/* Assume budget_range is used; adapt if min/max fields available */}
                  {ticket.budget_range}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                  <Zap className="h-4 w-4" />
                  Urgency
                </h3>
                <Badge
                  variant="outline"
                  className={`
                ${
                  ticket.urgency === "low"
                    ? "bg-blue-50 text-blue-800 border-blue-200"
                    : ticket.urgency === "high"
                    ? "bg-orange-50 text-orange-800 border-orange-200"
                    : ticket.urgency === "critical"
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-yellow-50 text-yellow-800 border-yellow-200"
                } capitalize
              `}
                >
                  {ticket.urgency}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {/* QA Section, only visible for developer in progress */}
      {canSubmitQA && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Submit for QA</CardTitle>
            <CardDescription>Mark your work as ready for review</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              When you've completed the requested work, submit it for QA and client review.
            </p>
            <Button
              className="w-full"
              onClick={onSubmitQA}
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Submit for QA
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default TicketSidebar;
